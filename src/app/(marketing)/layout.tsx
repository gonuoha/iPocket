import type { Metadata } from "next";

import { MarketingScroll } from "@/components/marketing/marketing-scroll";

export const metadata: Metadata = {
  title: "Memex — Stop Losing Your Developer Knowledge",
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
      <div className="min-w-0 max-w-full">{children}</div>
    </>
  );
}
