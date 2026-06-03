import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { marketingFooterNav } from "@/lib/navigation/marketing";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="public-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-sm text-sm text-neutral-400">
              Connect licensed drone pilots with clients for aerial video,
              surveys, inspections, and professional drone services.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              {marketingFooterNav.product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-400 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              {marketingFooterNav.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-400 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-neutral-800 pt-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Drone Pilot Marketplace. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
