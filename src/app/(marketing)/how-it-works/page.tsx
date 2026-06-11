import { HowItWorksHero } from "@/components/marketing/how-it-works/HowItWorksHero";
import { HowItWorksPathCta } from "@/components/marketing/how-it-works/HowItWorksPathCta";
import { HowItWorksProcess } from "@/components/marketing/how-it-works/HowItWorksProcess";

export const metadata = {
  title: "How It Works — Remote Air Service",
  description:
    "Learn how clients post drone projects and pilots access professional opportunities on Remote Air Service.",
};

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorksHero />
      <HowItWorksProcess />
      <HowItWorksPathCta />
    </>
  );
}
