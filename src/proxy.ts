import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/utils/env";

const ADMIN_ID = "db3713a1-6aa0-42bd-95fd-75e869520609";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Kiểm tra admin
  if (pathname.startsWith("/admin")) {
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== ADMIN_ID) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};