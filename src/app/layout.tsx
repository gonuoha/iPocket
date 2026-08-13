import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { AppearanceProvider } from "@/components/theme/appearance-provider";
import { Toaster } from "@/components/ui/sonner";
import {
  APPEARANCE_COOKIE_NAME,
  APPEARANCE_INLINE_SCRIPT,
  parseAppearance,
} from "@/lib/appearance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memex",
  description: "Memex application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const appearance = parseAppearance(
    cookieStore.get(APPEARANCE_COOKIE_NAME)?.value,
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-svh antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: APPEARANCE_INLINE_SCRIPT }}
        />
      </head>
      <body className="relative flex min-h-svh flex-col">
        <AppearanceProvider initialAppearance={appearance}>
          <SkipToContent />
          {children}
          <Toaster />
        </AppearanceProvider>
      </body>
    </html>
  );
}
