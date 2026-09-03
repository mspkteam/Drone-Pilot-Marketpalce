"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  required,
  autoComplete = "current-password",
  minLength,
  className,
  inputClassName,
  labelClassName,
}: PasswordFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={fieldId} className={labelClassName}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={fieldId}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-full pr-11", inputClassName)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M9.88 9.94A3 3 0 0012 15a3 3 0 002.12-.88M6.6 6.72C4.34 8.1 2.7 10.2 2.25 12c0 0 3.75 6.75 9.75 6.75 1.7 0 3.2-.4 4.5-1.02M10.5 5.4C11 5.33 11.5 5.25 12 5.25c6 0 9.75 6.75 9.75 6.75a18.4 18.4 0 01-2.2 2.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
