import { CONTACT_SUPPORT_CARDS } from "@/lib/marketing/contact-content";
import { cn } from "@/lib/utils";

function SupportIcon({
  type,
  className,
}: {
  type: (typeof CONTACT_SUPPORT_CARDS)[number]["icon"];
  className?: string;
}) {
  const paths = {
    client: (
      <path
        d="M4 7h12M4 7V5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5V7M4 7v8.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V7M8 11h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    pilot: (
      <path
        d="M10 4.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM4.5 16.5v-1a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    general: (
      <path
        d="M5 6.5h10M5 10.5h6M5 14.5h8M6 4.5h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <svg
      className={cn("h-7 w-7 text-gold", className)}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      aria-hidden
    >
      {paths[type]}
    </svg>
  );
}

export function ContactSupportCards() {
  return (
    <section
      className="figma-contact-section figma-marketing-section"
      aria-label="Support options"
    >
      <div className="public-container">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_SUPPORT_CARDS.map((card) => (
            <li
              key={card.title}
              className="flex min-h-[9.5rem] flex-col rounded-[14px] border border-ras-gold-subtle bg-ras-card p-6 transition-colors hover:border-[rgba(216,179,57,0.22)]"
            >
              <SupportIcon type={card.icon} />
              <h2 className="mt-5 text-[15px] font-bold tracking-tight text-ras-text">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-[1.55] text-ras-soft">
                {card.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
