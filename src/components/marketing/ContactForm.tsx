"use client";

import { useState } from "react";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p
        className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-6 text-sm text-gold-dark"
        role="status"
      >
        Thanks for reaching out. We&apos;ll respond to {email} as soon as we can.
        (Phase 1: message captured in UI only — email integration coming soon.)
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <FormField label="Name" htmlFor="contact-name" required>
        <input
          id="contact-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField label="Email" htmlFor="contact-email" required>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField label="Message" htmlFor="contact-message" required>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <Button type="submit">Send message</Button>
    </form>
  );
}
