"use client";

import { signIn } from "@/actions/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { LoginFormSchema } from "@/schemas/auth";
import { LockPassword, Mail } from "@/utils/icons";
import { addToast, Button, Divider, Input, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthFormProps } from "./Forms";
import { useRouter } from "@bprogress/next/app";
import GoogleLoginButton from "@/components/ui/button/GoogleLoginButton";

const AuthLoginForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      loginPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const { success, message } = await signIn(data);

    addToast({
      title: success ? "Đăng nhập thành công! Chào mừng trở lại 👋" : message,
      color: success ? "success" : "danger",
    });

    if (!success) return;

    return router.push("/");
  });

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <p className="text-small text-foreground-500 mb-4 text-center">
          Đăng nhập để tiếp tục hành trình xem phim của bạn 🎬
        </p>
        <Input
          {...register("email")}
          isInvalid={!!errors.email?.message}
          errorMessage={errors.email?.message}
          isRequired
          label="Email"
          placeholder="Nhập email của bạn"
          type="email"
          variant="underlined"
          startContent={<Mail className="text-xl" />}
          isDisabled={isSubmitting}
        />
        <PasswordInput
          {...register("loginPassword")}
          isInvalid={!!errors.loginPassword?.message}
          errorMessage={errors.loginPassword?.message}
          isRequired
          variant="underlined"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          startContent={<LockPassword className="text-xl" />}
          isDisabled={isSubmitting}
        />
        <div className="flex w-full items-center justify-end px-1 py-2">
          <Link
            size="sm"
            className="text-foreground cursor-pointer"
            onClick={() => setForm("forgot")}
            isDisabled={isSubmitting}
          >
            Quên mật khẩu?
          </Link>
        </div>
        <Button
          className="mt-4"
          color="primary"
          type="submit"
          variant="shadow"
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
      <div className="flex items-center gap-4">
        <Divider className="flex-1" />
        <p className="text-tiny text-default-500 shrink-0">HOẶC</p>
        <Divider className="flex-1" />
      </div>
      <GoogleLoginButton isDisabled={isSubmitting} />
      <p className="text-small text-center">
        Chưa có tài khoản?{" "}
        <Link
          isBlock
          size="sm"
          className="cursor-pointer"
          onClick={() => setForm("register")}
          isDisabled={isSubmitting}
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default AuthLoginForm;