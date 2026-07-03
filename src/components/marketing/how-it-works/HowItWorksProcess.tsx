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
    <ol
      className={cn(
        "figma-how-it-works-steps",
        tab === "clients"
          ? "figma-how-it-works-steps--clients"
          : "figma-how-it-works-steps--pilots",
      )}
    >
      {steps.map((step) => (
        <li key={step.number} className="figma-how-it-works-step-card">
          <span className="figma-client-step-badge">{step.number}</span>
          <h3 className="text-base font-bold tracking-[-0.02em] text-ras-heading">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ras-warm">
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
    <section className="figma-how-it-works-process" aria-label="Workflow process">
      <div className="public-container figma-how-it-works-process-inner">
        <div
          className="figma-how-it-works-tabs"
          role="tablist"
          aria-label="Choose client or pilot workflow"
        >
          {HOW_IT_WORKS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "figma-how-it-works-tab",
                  isActive && "figma-how-it-works-tab--active",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="figma-how-it-works-steps-panel"
        >
          <WorkflowCards tab={activeTab} />
        </div>
      </div>
    </section>
  );
}
