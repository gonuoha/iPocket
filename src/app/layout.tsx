import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { Toaster } from "@/components/ui/sonner";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-svh antialiased`}
    >
      <body className="relative flex min-h-svh flex-col">
        <SkipToContent />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
