"use client";

import { useState } from "react";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { PRICING_FAQ_ITEMS } from "@/lib/marketing/pricing-content";
import { cn } from "@/lib/utils";

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faq"
      className="figma-pricing-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Pricing FAQ"
    >
      <div className="public-container">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20">
          <div>
            <MarketingSectionLabel>FAQ</MarketingSectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ras-text sm:text-[2.25rem]">
              Common Pricing Questions
            </h2>
          </div>

          <div className="space-y-3">
            {PRICING_FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.number}
                  className="overflow-hidden rounded-[10px] border border-ras-gold-subtle bg-ras-card"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span className="shrink-0 font-mono text-xs font-bold text-gold">
                      {item.number}
                    </span>
                    <span className="flex-1 text-base font-bold text-ras-text">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-bold",
                        isOpen
                          ? "border-[rgba(216,179,57,0.35)] text-gold"
                          : "border-[rgba(255,255,255,0.08)] text-ras-soft",
                      )}
                      aria-hidden
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-[rgba(255,255,255,0.05)] px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
                      <p className="pl-8 text-sm leading-relaxed text-ras-soft sm:pl-9">
                        {item.answer}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
