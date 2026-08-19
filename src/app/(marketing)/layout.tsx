import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <div className="flex flex-1 flex-col pb-20 sm:pb-0">{children}</div>
      <MarketingFooter />
    </>
  );
}
