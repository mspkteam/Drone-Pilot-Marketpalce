import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { listPaymentsForClientUser } from "@/lib/payments/payment";
import { renderPaymentInvoicePdf } from "@/lib/payments/invoice-pdf";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await context.params;
  const payments = await listPaymentsForClientUser(authResult.userId);
  const index = payments.findIndex((p) => p.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  const payment = payments[index];
  const invoiceLabel = `INV-${1001 + index}`;
  const pdf = await renderPaymentInvoicePdf(payment, invoiceLabel);
  const filename = `${invoiceLabel}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
