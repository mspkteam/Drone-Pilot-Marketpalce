"use client";

import { useCallback, useRef, useState } from "react";
import { AdminSupportPanel } from "@/components/admin/AdminSupportPanel";
import { AdminSupportThread } from "@/components/admin/AdminSupportThread";

type AdminSupportChatProps = {
  readOnly: boolean;
  initialChatId?: string;
};

export function AdminSupportChat({
  readOnly,
  initialChatId,
}: AdminSupportChatProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    initialChatId ?? null,
  );
  const [mobileThreadOpen, setMobileThreadOpen] = useState(!!initialChatId);
  const [refreshToken, setRefreshToken] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const listRefreshRef = useRef<(() => Promise<void>) | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await listRefreshRef.current?.();
    setRefreshToken((value) => value + 1);
    setRefreshing(false);
  }, []);

  function handleSelectChat(id: string) {
    setSelectedChatId(id);
    setMobileThreadOpen(true);
  }

  return (
    <div className="admin-support-page">
      <section
        className="admin-support-hero admin-ops-bracket-card"
        aria-label="Support Chat"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-support-hero-copy">
          <p className="admin-ops-eyebrow">ACCOUNT / SUPPORT</p>
          <h1 className="admin-support-hero-title">Support Chat</h1>
          <p className="admin-support-hero-desc">
            Contact Ground Control for account, project, payment, verification,
            or platform support.
          </p>
          <p className="admin-support-hero-note">
            {readOnly
              ? "Moderators can view support conversations and attachments but cannot reply or change status."
              : "Manage and reply to platform support conversations. Status changes apply to the requester experience."}
          </p>
        </div>
        <div className="admin-support-hero-actions">
          <button
            type="button"
            className="admin-support-refresh-btn"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
          >
            Refresh
          </button>
        </div>
      </section>

      <div
        className={`admin-support-inbox${
          mobileThreadOpen ? " admin-support-inbox--thread-open" : ""
        }`}
      >
        <AdminSupportPanel
          readOnly={readOnly}
          embedded
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onRegisterRefresh={(refresh) => {
            listRefreshRef.current = refresh;
          }}
        />

        <section
          className="admin-support-thread-panel"
          aria-label="Support conversation"
        >
          {!selectedChatId ? (
            <div className="admin-support-messages">
              <p className="admin-support-messages-status">
                Select a support conversation to view its history.
              </p>
            </div>
          ) : (
            <AdminSupportThread
              chatId={selectedChatId}
              readOnly={readOnly}
              embedded
              refreshToken={refreshToken}
              onBack={() => setMobileThreadOpen(false)}
            />
          )}
        </section>
      </div>
    </div>
  );
}
