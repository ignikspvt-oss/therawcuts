"use client";

import dynamic from "next/dynamic";

const Collections = dynamic(() => import("@/components/Collections"), {
  loading: () => <div aria-hidden="true" style={{ minHeight: "60vh" }} />,
  ssr: false,
});

export default function CollectionsClient() {
  return <Collections />;
}
