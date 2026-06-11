export const SUPPORT_OPEN_EVENT = "dm:support:open";

export type SupportOpenDetail = {
  action?: "open" | "new";
  chatId?: string;
};

/** Opens the global SupportChatWidget without duplicating ticket UI. */
export function openSupportChatWidget(detail: SupportOpenDetail = { action: "open" }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SupportOpenDetail>(SUPPORT_OPEN_EVENT, { detail }),
  );
}
