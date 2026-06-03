"use client";

import { COMPLIANCE_CHECKLIST_ITEMS } from "@/lib/pilot/compliance";
import { cn } from "@/lib/utils";

type ComplianceChecklistProps = {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function ComplianceChecklist({
  value,
  onChange,
  disabled,
}: ComplianceChecklistProps) {
  function toggle(id: string) {
    if (disabled) return;
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium">Compliance checklist</legend>
      <p className="text-xs text-muted-foreground">
        Required before you can submit your profile for review.
      </p>
      <ul className="space-y-3">
        {COMPLIANCE_CHECKLIST_ITEMS.map((item) => {
          const checked = value.includes(item.id);
          return (
            <li key={item.id}>
              <label
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition-colors",
                  checked
                    ? "border-gold bg-gold/5"
                    : "border-border hover:border-gold/40",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-gold focus:ring-gold"
                  checked={checked}
                  onChange={() => toggle(item.id)}
                  disabled={disabled}
                />
                <span>{item.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
