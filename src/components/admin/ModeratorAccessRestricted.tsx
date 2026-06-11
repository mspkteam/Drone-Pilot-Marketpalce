import Link from "next/link";

type ModeratorAccessRestrictedProps = {
  title?: string;
  message?: string;
};

export function ModeratorAccessRestricted({
  title = "Access restricted",
  message = "Your admin has disabled access to this area.",
}: ModeratorAccessRestrictedProps) {
  return (
    <section className="admin-perms-restricted" aria-labelledby="access-restricted-title">
      <div className="admin-perms-restricted-card">
        <p className="admin-perms-restricted-eyebrow">ACCESS CONTROL</p>
        <h1 id="access-restricted-title" className="admin-perms-restricted-title">
          {title}
        </h1>
        <p className="admin-perms-restricted-message">{message}</p>
        <Link href="/dashboard/admin" className="admin-perms-restricted-btn">
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
