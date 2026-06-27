import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { homeAssets } from "@/lib/marketing/home-assets";
import { marketingFooterNav } from "@/lib/navigation/marketing";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--color-border-muted)] bg-[var(--color-bg-soft)] text-sidebar-foreground">
      <div className="public-container py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="light" size="footer" />
            <p className="mt-6 max-w-xs text-base leading-relaxed text-ras-warm">
              Aviation-grade drone operations for the modern enterprise.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://remoteairservice.com"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 transition-opacity hover:opacity-100"
                aria-label="Remote Air Service website"
              >
                <Image
                  src={homeAssets.footer.socialGlobe}
                  alt=""
                  width={19}
                  height={19}
                  className="h-[1.2rem] w-[1.2rem] object-contain"
                  aria-hidden
                />
              </a>
              <a
                href="/contact"
                className="opacity-80 transition-opacity hover:opacity-100"
                aria-label="Share or contact"
              >
                <Image
                  src={homeAssets.footer.socialShare}
                  alt=""
                  width={17}
                  height={19}
                  className="h-[1.2rem] w-[1.1rem] object-contain"
                  aria-hidden
                />
              </a>
            </div>
          </div>

          {marketingFooterNav.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-ras-text">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-base text-ras-warm transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {column.title === "Compliance" ? (
                <Link
                  href="/contact"
                  className="ras-btn-primary mt-5 inline-flex min-h-10 px-5 text-xs uppercase tracking-[0.12em]"
                >
                  Talk to Support
                </Link>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ras-border-muted pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-ras-warm">
            © 2024 Remote Air Service. Aviation-Grade Operations.
          </p>
        </div>
      </div>
    </footer>
  );
}
