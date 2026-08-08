import Script from "next/script";

import { getHomepageMarkup } from "@/lib/marketing/get-homepage-markup";

export default function HomePage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getHomepageMarkup() }} />
      <Script src="/homepage/script.js" strategy="afterInteractive" />
    </>
  );
}
