import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../../../prototypes/homepage/styles.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "iPocket — Stop Losing Your Developer Knowledge",
  description:
    "One searchable hub for code snippets, AI prompts, commands, notes, files, images, and links.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={inter.className}>{children}</div>;
}
