import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotHelpArticleView } from "@/components/dashboard/pilot/support/PilotHelpArticleView";
import { DashboardPageLayout } from "@/components/dashboard";
import { getHelpArticleBySlug } from "@/lib/help/help-articles";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-support.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getHelpArticleBySlug(slug);
  return { title: article?.title ?? "Help Article" };
}

export default async function PilotHelpArticlePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  const { slug } = await params;
  const article = getHelpArticleBySlug(slug);
  if (!article || article.status !== "published") {
    notFound();
  }
  if (article.audience !== "pilot" && article.audience !== "all") {
    notFound();
  }

  return (
    <DashboardPageLayout className="pilot-support-shell">
      <PilotHelpArticleView article={article} />
    </DashboardPageLayout>
  );
}
