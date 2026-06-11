import { redirect } from "next/navigation";

/**
 * Admin review moderation removed — reviews publish directly from client/pilot flows.
 * @see src/lib/reviews/review.ts createReview (status: published)
 */
export default function AdminReviewsPage() {
  redirect("/dashboard/admin");
}
