"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { Button } from "@/components/ui/Button";
import type { ApplicationStatus } from "@/types/application";
import type { ClientJobApplicationDto } from "@/types/booking";

type OffersResponse = {
  jobId: string;
  jobStatus: string;
  hasBooking: boolean;
  offers: ClientJobApplicationDto[];
  error?: string;
};

type ClientJobOffersProps = {
  jobId: string;
};

export function ClientJobOffers({ jobId }: ClientJobOffersProps) {
  const router = useRouter();
  const [data, setData] = useState<OffersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/client/jobs/${jobId}/applications`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
          const offers = (json.offers ?? []) as ClientJobApplicationDto[];
          for (const offer of offers) {
            void fetch(
              `/api/client/jobs/${jobId}/applications/${offer.id}/view`,
              { method: "POST" },
            ).catch(() => {
              /* best-effort */
            });
          }
        }
      })
      .catch(() => setError("Failed to load offers."))
      .finally(() => setLoading(false));
  }, [jobId]);

  async function handleAccept(applicationId: string) {
    setError(null);
    setAcceptingId(applicationId);
    try {
      const res = await fetch(
        `/api/client/jobs/${jobId}/applications/${applicationId}/accept`,
        { method: "POST" },
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to accept offer.");
        return;
      }
      router.push(`/dashboard/client/bookings/${json.booking.id}?accepted=1`);
      router.refresh();
    } catch {
      setError("Failed to accept offer.");
    } finally {
      setAcceptingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading offers…</p>;
  }

  if (error && !data) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!data) return null;

  if (data.hasBooking) {
    return (
      <p className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark">
        A pilot has been assigned to this job.{" "}
        <Link
          href={`/dashboard/client/jobs/${jobId}`}
          className="font-medium underline"
        >
          View job
        </Link>{" "}
        or check{" "}
        <Link href="/dashboard/client/bookings" className="font-medium underline">
          your bookings
        </Link>
        .
      </p>
    );
  }

  const submitted = data.offers.filter((o) => o.status === "submitted");

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {submitted.length === 0 ? (
        <div className="empty-state">
          <p className="text-muted-foreground">
            No pending offers yet. Pilots can bid once your job is open.
          </p>
        </div>
      ) : (
        <ul className="list-panel">
          {data.offers.map((offer) => (
            <li key={offer.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">{offer.pilot.displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    {[offer.pilot.locationCity, offer.pilot.locationRegion]
                      .filter(Boolean)
                      .join(", ") || "Location not set"}
                  </p>
                  <p className="mt-2 text-sm">
                    {offer.currency} {offer.proposedAmount.toLocaleString()}
                    {offer.estimatedDeliveryDate
                      ? ` · Delivery ${new Date(offer.estimatedDeliveryDate).toLocaleDateString()}`
                      : ""}
                  </p>
                  {offer.message ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {offer.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <ApplicationStatusBadge
                    status={offer.status as ApplicationStatus}
                  />
                  {offer.status === "submitted" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={acceptingId !== null}
                      onClick={() => handleAccept(offer.id)}
                    >
                      {acceptingId === offer.id ? "Accepting…" : "Accept pilot"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
