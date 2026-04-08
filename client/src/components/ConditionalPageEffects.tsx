"use client";

import { usePathname } from "next/navigation";
import PageLoader from "./PageLoader";
import IntroText from "./IntroText";

export default function ConditionalPageEffects() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <PageLoader />
      <IntroText />
    </>
  );
}
