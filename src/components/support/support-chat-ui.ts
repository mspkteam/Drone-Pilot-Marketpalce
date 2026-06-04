import type { SupportChatMessageDto, SupportChatStatus } from "@/types/support";

export const SUPPORT_STATUS_LABELS: Record<SupportChatStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export const SUPPORT_STATUS_BADGE: Record<SupportChatStatus, string> = {
  open: "border-gold/40 bg-gold/10 text-gold-light",
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  resolved: "border-emerald-600/40 bg-emerald-600/10 text-emerald-200",
  closed: "border-border bg-surface text-muted-foreground",
};

export function formatSupportTicketId(chatId: string): string {
  const compact = chatId.replace(/[^a-zA-Z0-9]/g, "");
  return compact.slice(-8).toUpperCase() || chatId.slice(0, 8).toUpperCase();
}

export function formatSupportMessageTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function requesterSenderLabel(
  m: SupportChatMessageDto,
  viewerIsRequester: boolean,
): string | null {
  if (m.isSystem) return null;
  if (m.senderRole === "admin") return "Support";
  return viewerIsRequester ? "You" : m.senderName;
}

export function adminSenderLabel(m: SupportChatMessageDto): string | null {
  if (m.isSystem) return "System";
  if (m.senderRole === "admin") return "Support";
  return m.senderName;
}

export function supportAttachmentHref(
  fileName: string,
  guestToken?: string | null,
): string {
  const base = `/api/support/files/${encodeURIComponent(fileName)}`;
  if (guestToken) {
    return `${base}?guestToken=${encodeURIComponent(guestToken)}`;
  }
  return base;
}
