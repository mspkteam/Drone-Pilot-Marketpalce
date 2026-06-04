import { MarketingPage } from "@/components/layout/MarketingPage";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Contact the Drone Pilot Marketplace team.",
};

export default function ContactPage() {
  return (
    <MarketingPage
      badge="Support"
      title="Contact"
      description="Questions about the platform, partnerships, or support — send us a message."
      narrow
    >
      <div className="space-y-8">
        <p className="text-sm text-muted-foreground">
          For account issues, use your dashboard after signing in. This form is for
          general inquiries and partnership interest.
        </p>
        <ContactForm />
        <p className="text-sm text-muted-foreground">
          Email:{" "}
          <a
            href="mailto:hello@dronepilot.local"
            className="text-gold-dark hover:text-gold"
          >
            hello@dronepilot.local
          </a>{" "}
          (demo)
        </p>
      </div>
    </MarketingPage>
  );
}
