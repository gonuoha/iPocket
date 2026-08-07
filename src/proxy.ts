import { NextResponse } from "next/server";

import { auth } from "@/auth";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  const isDashboard = pathname.startsWith("/dashboard");
  const isProfile = pathname === "/profile";
  const isSettings = pathname === "/settings";
  const isItems = pathname.startsWith("/items");
  const isCollections = pathname.startsWith("/collections");

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (
    (isDashboard || isProfile || isSettings || isItems || isCollections) &&
    !isLoggedIn
  ) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/sign-in",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/profile",
    "/settings",
    "/items",
    "/items/:path*",
    "/collections",
    "/collections/:path*",
  ],
};
