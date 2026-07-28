"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AdminClientMemberProfile } from "@/components/dashboard/admin/personnel/AdminClientMemberProfile";
import { AdminPersonnelEditModal } from "@/components/dashboard/admin/personnel/AdminPersonnelEditModal";
import { AdminPilotMemberProfile } from "@/components/dashboard/admin/personnel/AdminPilotMemberProfile";
import type { AdminMemberDetailDto } from "@/lib/admin/member-detail";

type AdminMemberDetailViewProps = {
  member: AdminMemberDetailDto;
  canEdit: boolean;
  canAssignBadges?: boolean;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminMemberDetailView({
  member,
  canEdit,
  canAssignBadges = false,
}: AdminMemberDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const { account, pilotDetail, clientDetail } = member;

  const backHref =
    searchParams.get("from") === "pilots" ||
    searchParams.get("role") === "pilot"
      ? "/dashboard/admin/users?role=pilot"
      : searchParams.get("from") === "clients" ||
          searchParams.get("role") === "client"
        ? "/dashboard/admin/users?role=client"
        : "/dashboard/admin/users";

  const isPilotMember = Boolean(pilotDetail);
  const isClientMember = Boolean(clientDetail) && !pilotDetail;
  const eyebrow = isPilotMember
    ? "PILOT PROFILE"
    : isClientMember
      ? "CLIENT PROFILE"
      : member.roleLabel.toUpperCase();
  const heroDesc = isPilotMember
    ? "Review membership, moderate the profile, and assign wings or badges."
    : isClientMember
      ? "Manage client details, preferences, jobs, bookings, disputes, and messages."
      : "Member account overview.";

  return (
    <div className="admin-member-detail">
      <div className="admin-member-detail-nav">
        <Link href={backHref} className="admin-personnel-action">
          ← Back to directory
        </Link>
        {canEdit ? (
          <button
            type="button"
            className="admin-personnel-btn-outline"
            onClick={() => setEditOpen(true)}
          >
            Account settings
          </button>
        ) : null}
      </div>

      <header className="admin-member-detail-hero admin-ops-bracket-card">
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-member-detail-hero-inner">
          <div className="admin-member-detail-hero-copy">
            <p className="admin-ops-eyebrow">{eyebrow}</p>
            <h1 className="admin-member-detail-title">{member.displayName}</h1>
            <p className="admin-member-detail-sub">{account.email}</p>
            <p className="admin-member-detail-desc">{heroDesc}</p>
            <div className="admin-member-detail-badges">
              <span className="admin-member-chip">Login: {account.status}</span>
              {pilotDetail ? (
                <span className="admin-member-chip">
                  Profile: {pilotDetail.status}
                </span>
              ) : null}
              {clientDetail ? (
                <span className="admin-member-chip">
                  Client: {clientDetail.status}
                </span>
              ) : null}
              <span className="admin-member-chip">
                Joined {formatDate(account.createdAt)}
              </span>
            </div>
            {account.moderationNote ? (
              <p className="admin-member-moderation" role="note">
                Moderation note: {account.moderationNote}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      {pilotDetail ? (
        <AdminPilotMemberProfile
          userId={account.id}
          pilot={pilotDetail}
          canEdit={canEdit}
          canAssignBadges={canAssignBadges}
        />
      ) : null}

      {clientDetail ? (
        <AdminClientMemberProfile
          userId={account.id}
          client={clientDetail}
          canEdit={canEdit}
          accountStatus={account.status}
        />
      ) : null}

      {!pilotDetail && !clientDetail ? (
        <p className="admin-member-empty">
          This account has no pilot or client profile yet.
        </p>
      ) : null}

      <AdminPersonnelEditModal
        open={editOpen}
        userId={account.id}
        onClose={() => setEditOpen(false)}
        onSaved={() => router.refresh()}
      />

      <p className="admin-member-detail-foot">
        <Link href={backHref}>Return to Fleet &amp; Personnel</Link>
      </p>
    </div>
  );
}
