import { WaitlistLanding } from "@/components/WaitlistLanding";

export default function Page() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_WAITLIST_API_URL;
  if (!apiBaseUrl) {
    return (
      <div className="waitlist-config-error">
        <p>
          Set <code>NEXT_PUBLIC_WAITLIST_API_URL</code> to your marketplace API
          origin (e.g. https://your-app.vercel.app).
        </p>
      </div>
    );
  }

  const source =
    process.env.NEXT_PUBLIC_WAITLIST_SOURCE?.trim() || "standalone-landing";
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL?.trim() || "/logo.png";

  return (
    <WaitlistLanding apiBaseUrl={apiBaseUrl} source={source} logoUrl={logoUrl} />
  );
}
