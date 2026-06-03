"use client";

import dynamic from "next/dynamic";

const SupportChatWidget = dynamic(
  () =>
    import("@/components/support/SupportChatWidget").then(
      (m) => m.SupportChatWidget,
    ),
  { ssr: false },
);

export function SupportChatWidgetLoader() {
  return <SupportChatWidget />;
}
