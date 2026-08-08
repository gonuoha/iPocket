import type { Metadata } from "next";

import { MarketingScroll } from "@/components/marketing/marketing-scroll";

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
  return (
    <>
      <MarketingScroll />
      {children}
    </>
  );
}
