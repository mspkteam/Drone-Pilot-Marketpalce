"use client";

import { useState } from "react";
import { CONTACT_ROLE_OPTIONS } from "@/lib/marketing/contact-content";
import { cn } from "@/lib/utils";

const contactLabelClassName =
  "block text-sm font-medium text-ras-muted";

const contactInputClassName =
  "block w-full rounded-lg border border-[rgba(216,179,57,0.22)] bg-surface px-3.5 py-2.5 text-sm text-ras-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-ras-dim transition-[border-color,box-shadow] duration-200 hover:border-[rgba(216,179,57,0.35)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[rgba(216,179,57,0.25)]";

const contactTextareaClassName = cn(contactInputClassName, "min-h-[8.5rem] resize-y");

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type ContactFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
};

function ContactField({ label, htmlFor, children, className }: ContactFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className={contactLabelClassName}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("client");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          role,
          subject,
          message,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send message.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Could not send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-[14px] border border-[rgba(216,179,57,0.28)] bg-surface px-6 py-8"
        role="status"
      >
        <p className="text-sm leading-relaxed text-gold">
          Thanks for reaching out. We&apos;ll respond to {email} within 1–2
          business days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-[14px] border border-[rgba(216,179,57,0.15)] bg-surface p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ContactField label="Full Name" htmlFor="contact-full-name">
          <input
            id="contact-full-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={contactInputClassName}
            autoComplete="name"
          />
        </ContactField>
        <ContactField label="Email" htmlFor="contact-email">
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={contactInputClassName}
            autoComplete="email"
          />
        </ContactField>
        <ContactField label="Phone Number" htmlFor="contact-phone">
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={contactInputClassName}
            autoComplete="tel"
          />
        </ContactField>
        <ContactField label="I am a" htmlFor="contact-role">
          <div className="relative">
            <select
              id="contact-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={cn(contactInputClassName, "appearance-none pr-10")}
            >
              {CONTACT_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ras-soft"
              aria-hidden
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </ContactField>
      </div>

      <div className="mt-4 space-y-4">
        <ContactField label="Subject" htmlFor="contact-subject">
          <input
            id="contact-subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={contactInputClassName}
          />
        </ContactField>
        <ContactField label="Message" htmlFor="contact-message">
          <textarea
            id="contact-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={contactTextareaClassName}
          />
        </ContactField>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gold text-sm font-bold text-ras-cta transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send Message"}
        <ArrowIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
