import type { VerificationDto } from "@/types/verification";

type VerificationDocumentLinkProps = {
  verification: Pick<
    VerificationDto,
    "id" | "documentUrl" | "hasUploadedDocument" | "originalFileName"
  >;
  /** pilot sees own docs; admin uses admin API */
  audience: "pilot" | "admin";
};

export function VerificationDocumentLink({
  verification,
  audience,
}: VerificationDocumentLinkProps) {
  if (verification.hasUploadedDocument) {
    const href =
      audience === "pilot"
        ? `/api/pilot/verifications/${verification.id}/document`
        : `/api/admin/verifications/${verification.id}/document`;

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gold-dark hover:underline"
      >
        {verification.originalFileName ?? "View uploaded document"}
      </a>
    );
  }

  if (verification.documentUrl) {
    return (
      <a
        href={verification.documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-sm text-gold-dark hover:underline"
      >
        {verification.documentUrl}
      </a>
    );
  }

  return (
    <span className="text-sm text-muted-foreground">No document attached</span>
  );
}
