"use client";

import { TypewriterMessage } from "@/components/support/TypewriterMessage";
import {
  adminSenderLabel,
  formatSupportMessageTime,
  requesterSenderLabel,
  supportAttachmentHref,
} from "@/components/support/support-chat-ui";
import type { SupportChatMessageDto } from "@/types/support";
import { cn } from "@/lib/utils";

type SupportMessageBubbleProps = {
  message: SupportChatMessageDto;
  guestToken?: string | null;
  /** User widget: requester messages on the right */
  variant: "user" | "admin";
  animate?: boolean;
};

function AttachmentBlock({
  message,
  guestToken,
}: {
  message: SupportChatMessageDto;
  guestToken?: string | null;
}) {
  if (!message.attachmentUrl) return null;

  const href = supportAttachmentHref(message.attachmentUrl, guestToken);
  const isImage = message.attachmentMimeType?.startsWith("image/");

  if (isImage) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block overflow-hidden rounded-md border border-border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={href}
          alt={message.attachmentFileName ?? "Attachment"}
          className="max-h-36 w-full object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex items-center gap-2 rounded-md border border-gold/30 bg-surface px-3 py-2 text-xs text-gold-light hover:border-gold/50"
    >
      <span className="font-medium">
        {message.attachmentFileName ?? "View attachment"}
      </span>
      <span className="text-muted-foreground">↗</span>
    </a>
  );
}

export function SupportMessageBubble({
  message: m,
  guestToken,
  variant,
  animate = false,
}: SupportMessageBubbleProps) {
  const senderLabel =
    variant === "user"
      ? requesterSenderLabel(m, true)
      : adminSenderLabel(m);

  const isRequester =
    !m.isSystem && m.senderRole !== "admin" && m.senderRole !== "system";

  return (
    <div
      className={cn(
        "max-w-[92%] rounded-lg px-3 py-2.5 text-sm",
        m.isSystem
          ? "mx-auto w-full max-w-full border border-gold/30 bg-gold/10 text-gold-light"
          : variant === "user"
            ? isRequester
              ? "ml-auto mr-0 bg-gold/15 text-foreground"
              : "ml-0 mr-auto bg-surface-elevated"
            : m.senderRole === "admin"
              ? "ml-auto bg-gold/15"
              : "bg-surface-elevated",
      )}
    >
      {senderLabel ? (
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {senderLabel}
          </p>
          <time
            className="shrink-0 text-[10px] text-muted-foreground"
            dateTime={m.createdAt}
          >
            {formatSupportMessageTime(m.createdAt)}
          </time>
        </div>
      ) : (
        <time
          className="mb-1 block text-right text-[10px] text-muted-foreground"
          dateTime={m.createdAt}
        >
          {formatSupportMessageTime(m.createdAt)}
        </time>
      )}
      <p className="whitespace-pre-wrap leading-relaxed">
        {animate && m.senderRole === "admin" && variant === "user" ? (
          <TypewriterMessage text={m.message} animate />
        ) : (
          m.message
        )}
      </p>
      <AttachmentBlock message={m} guestToken={guestToken} />
    </div>
  );
}
