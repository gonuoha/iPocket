import { NextResponse } from "next/server";

import { auth } from "@/auth";

export const proxy = auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );

    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
