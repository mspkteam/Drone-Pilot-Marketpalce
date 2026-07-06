import { SafetyCertification } from "@/components/marketing/safety/SafetyCertification";
import { SafetyHero } from "@/components/marketing/safety/SafetyHero";
import { SafetyOperationsCta } from "@/components/marketing/safety/SafetyOperationsCta";
import { SafetyPathCta } from "@/components/marketing/safety/SafetyPathCta";
import { SafetyVerifyOverview } from "@/components/marketing/safety/SafetyVerifyOverview";
import { SafetyWorkflow } from "@/components/marketing/safety/SafetyWorkflow";

export const metadata = {
  title: "Safety and Verification — Remote Air Service",
  description:
    "Learn how Remote Air Service verifies pilots, reviews certifications, and supports safer drone project workflows.",
};

export default function SafetyPage() {
  return (
    <div className="figma-safety-page">
      <SafetyHero />
      <SafetyVerifyOverview />
      <SafetyCertification />
      <SafetyOperationsCta />
      <SafetyWorkflow />
      <SafetyPathCta />
    </div>
  );
}
