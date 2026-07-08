import { WaitlistLandingView } from "@/components/waitlist/WaitlistLandingView";

export const metadata = {
  title: "Join the Waitlist",
  description:
    "Priority access for enterprise clients and pilots — Remote Air Service marketplace pre-launch.",
};

export default function LaunchWaitlistPage() {
  return <WaitlistLandingView source="launch-landing" />;
}
