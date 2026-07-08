import { WaitlistLanding } from "@/components/WaitlistLanding";

export default function Page() {
  const apiConfigured =
    process.env.WAITLIST_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_WAITLIST_API_URL?.trim();
  if (!apiConfigured) {
    return (
      <div className="waitlist-config-error">
        <p>
          Set <code>WAITLIST_API_URL</code> (or{" "}
          <code>NEXT_PUBLIC_WAITLIST_API_URL</code>) to your marketplace API
          origin (e.g. https://your-app.vercel.app).
        </p>
      </div>
    );
  }

  const source =
    process.env.NEXT_PUBLIC_WAITLIST_SOURCE?.trim() || "standalone-landing";
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL?.trim() || "/logo.png";

  return <WaitlistLanding source={source} logoUrl={logoUrl} />;
}
