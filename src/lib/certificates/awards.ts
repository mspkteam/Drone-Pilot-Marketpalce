import { evaluateAndAssignWings } from "@/lib/wings/wings";

/** Wings first, then certificates (certificates may depend on newly granted wings). */
export async function evaluatePilotAwards(pilotProfileId: string): Promise<void> {
  await evaluateAndAssignWings(pilotProfileId);
  const { evaluateAndIssueCertificates } = await import("@/lib/certificates/certificate");
  await evaluateAndIssueCertificates(pilotProfileId);
}
