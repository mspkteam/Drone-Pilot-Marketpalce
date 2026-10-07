"use client";

import { COUNTRY_OPTIONS, DEFAULT_COUNTRY } from "@/lib/geo/countries";
import { cn } from "@/lib/utils";

type CountrySelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  /** Include empty "Select country" option when true. */
  allowEmpty?: boolean;
};

export function CountrySelect({
  id,
  value,
  onChange,
  disabled,
  required,
  className,
  allowEmpty = false,
}: CountrySelectProps) {
  const normalized =
    value && (COUNTRY_OPTIONS as readonly string[]).includes(value)
      ? value
      : value
        ? value
        : allowEmpty
          ? ""
          : DEFAULT_COUNTRY;

  const options =
    value && !(COUNTRY_OPTIONS as readonly string[]).includes(value)
      ? [value, ...COUNTRY_OPTIONS]
      : [...COUNTRY_OPTIONS];

  return (
    <select
      id={id}
      className={cn(className)}
      value={normalized}
      required={required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {allowEmpty ? (
        <option value="" disabled>
          Select country
        </option>
      ) : null}
      {options.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
}
