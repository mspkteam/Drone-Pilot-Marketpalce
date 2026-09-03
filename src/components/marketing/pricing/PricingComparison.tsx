import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import {
  PRICING_COMPARISON_COLUMNS,
  PRICING_COMPARISON_ROWS,
} from "@/lib/marketing/pricing-content";

export function PricingComparison() {
  return (
    <section
      className="figma-pricing-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Plan comparison"
    >
      <div className="public-container">
        <div className="text-center">
          <MarketingSectionLabel centered>Compare</MarketingSectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ras-text sm:text-[2.25rem]">
            Plan Comparison
          </h2>
        </div>

        <div className="figma-pricing-table-scroll mt-14 overflow-x-auto rounded-[10px] border border-[rgba(216,179,57,0.12)] bg-surface">
          <p className="figma-pricing-table-hint px-4 pt-3 text-xs text-ras-soft md:hidden">
            Swipe sideways to compare grades
          </p>
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-surface px-6 py-4 text-left text-sm font-bold text-ras-text"
                >
                  Feature
                </th>
                {PRICING_COMPARISON_COLUMNS.map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-gold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRICING_COMPARISON_ROWS.map((row, rowIndex) => (
                <tr
                  key={row.feature}
                  className={
                    rowIndex < PRICING_COMPARISON_ROWS.length - 1
                      ? "border-b border-[rgba(255,255,255,0.06)]"
                      : undefined
                  }
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-surface px-6 py-4 text-left text-sm font-medium text-ras-text"
                  >
                    {row.feature}
                  </th>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={`${row.feature}-${PRICING_COMPARISON_COLUMNS[colIndex]}`}
                      className="px-4 py-4 text-center text-[13px] text-ras-soft"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
