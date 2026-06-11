import { CookieContent } from "@/components/marketing/cookies/CookieContent";
import { CookieHero } from "@/components/marketing/cookies/CookieHero";

export const metadata = {
  title: "Cookie Policy — Remote Air Service",
  description:
    "Learn how Remote Air Service uses cookies and similar technologies on the drone pilot marketplace website.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <CookieHero />
      <CookieContent />
    </>
  );
}
