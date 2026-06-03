type Step = {
  title: string;
  description: string;
};

export function MarketingSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-6">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-mono text-sm font-semibold text-gold-dark">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
