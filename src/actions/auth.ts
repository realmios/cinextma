"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import {
  ForgotPasswordFormInput,
  ForgotPasswordFormSchema,
  LoginFormInput,
  LoginFormSchema,
  RegisterFormInput,
  RegisterFormSchema,
  ResetPasswordFormInput,
  ResetPasswordFormSchema,
} from "@/schemas/auth";
import { z } from "zod";
import { ActionResponse } from "@/types";

type AuthAction<T> = (data: T, supabase: SupabaseClient) => ActionResponse;

const createAuthAction = <T extends { captchaToken?: string }>(
  schema: z.ZodSchema<T>,
  action: AuthAction<T>,
  admin?: boolean,
) => {
  return async (formData: T): ActionResponse => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(". ");
      return { success: false, message };
    }

    try {
      const supabase = await createClient(admin);
      return await action(result.data, supabase);
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: "An unexpected error occurred." };
    }
  };
};

const signInWithEmailAction: AuthAction<LoginFormInput> = async (data, supabase) => {
  const { data: user, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.loginPassword,
  });

  if (error) return { success: false, message: error.message };

  const { data: username, error: usernameError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.user.id)
    .maybeSingle();

  if (!username) {
    console.error("Username check error:", usernameError);
    return {
      success: false,
      message: `Database error. Could not get username for ${user.user.email}.`,
    };
  }

  return { success: true, message: `Welcome back, ${username.username}` };
};

const signUpAction: AuthAction<RegisterFormInput> = async (data, supabase) => {
  const { data: usernameExists, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username)
    .maybeSingle();

  if (usernameError) {
    console.error("Username check error:", usernameError);
    return { success: false, message: "Database error. Could not check username availability." };
  }

  if (usernameExists) {
    return { success: false, message: "Username already taken." };
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (signUpError) return { success: false, message: signUpError.message };
  if (!authData.user) return { success: false, message: "User not created. Please try again." };

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: authData.user.id, username: data.username });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    return { success: false, message: "Could not create user profile. Please contact support." };
  }

  return {
    success: true,
    message: "Đăng ký thành công! Hãy đăng nhập để tiếp tục.",
  };
};

const sendResetPasswordEmailAction: AuthAction<ForgotPasswordFormInput> = async (
  data,
  supabase,
) => {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email);

  if (error) return { success: false, message: error.message };

  return {
    success: true,
    message: `Chúng tôi đã gửi email đến ${data.email}. Kiểm tra thư mục spam nếu không thấy.`,
  };
};

const resetPasswordAction: AuthAction<ResetPasswordFormInput> = async (data, supabase) => {
  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Mật khẩu đã được đặt lại thành công." };
};

export const signIn = createAuthAction(LoginFormSchema, signInWithEmailAction);
export const signUp = createAuthAction(RegisterFormSchema, signUpAction, true);
export const sendResetPasswordEmail = createAuthAction(
  ForgotPasswordFormSchema,
  sendResetPasswordEmailAction,
);
export const resetPassword = createAuthAction(ResetPasswordFormSchema, resetPasswordAction);

export const signOut = async (): ActionResponse => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Bạn đã đăng xuất thành công." };
};