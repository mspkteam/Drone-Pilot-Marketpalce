"use client";

import { useState } from "react";
import {
  HOW_IT_WORKS_CLIENT_STEPS,
  HOW_IT_WORKS_PILOT_STEPS,
  HOW_IT_WORKS_TABS,
  type HowItWorksTab,
} from "@/lib/marketing/how-it-works-content";
import { cn } from "@/lib/utils";

function WorkflowCards({ tab }: { tab: HowItWorksTab }) {
  const steps =
    tab === "clients" ? HOW_IT_WORKS_CLIENT_STEPS : HOW_IT_WORKS_PILOT_STEPS;

  return (
    <ol className="mt-10 grid gap-5 pt-2 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step) => (
        <li
          key={step.number}
          className="relative rounded-[14px] border border-ras-gold-subtle bg-ras-card px-6 pb-6 pt-9"
        >
          <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-md bg-gold text-xs font-extrabold text-ras-cta shadow-lg">
            {step.number}
          </span>
          <h3 className="text-base font-bold tracking-tight text-ras-text">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ras-soft">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorksProcess() {
  const [activeTab, setActiveTab] = useState<HowItWorksTab>("clients");

  return (
    <section
      className="figma-how-it-works-process figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Workflow process"
    >
      <div className="public-container">
        <div
          className="inline-flex rounded-lg border border-[rgba(216,179,57,0.18)] bg-[rgba(216,179,57,0.04)] p-1"
          role="tablist"
          aria-label="Choose client or pilot workflow"
        >
          {HOW_IT_WORKS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-md px-5 py-2.5 text-sm font-bold transition-colors",
                  isActive
                    ? "bg-ras-soft text-ras-text shadow-sm"
                    : "border border-transparent text-gold-dark/80 hover:text-gold",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          <WorkflowCards tab={activeTab} />
        </div>
      </div>
    </section>
  );
}
