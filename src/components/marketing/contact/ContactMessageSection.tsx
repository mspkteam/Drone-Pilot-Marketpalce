import { ContactForm } from "@/components/marketing/ContactForm";

export function ContactMessageSection() {
  return (
    <section
      className="figma-contact-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)] pt-0"
      aria-label="Send a message"
    >
      <div className="public-container">
        <div className="rounded-[18px] border border-ras-gold-subtle bg-ras-card p-8 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-14 xl:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                Message Us
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ras-text sm:text-[2rem]">
                Send a Message
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ras-soft sm:text-base">
                We respond within 1–2 business days.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
