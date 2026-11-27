import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";

/** Ensure a Stripe Customer exists for this user (stored on User.stripeCustomerId). */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, stripeCustomerId: true, role: true },
  });
  if (!user) throw new Error("User not found.");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email,
    metadata: { userId: user.id, role: user.role },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}
