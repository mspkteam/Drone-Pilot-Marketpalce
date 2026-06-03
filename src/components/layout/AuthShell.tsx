import { PlaceholderCard } from "@/components/layout/PlaceholderCard";

type AuthShellProps = {
  title: string;
  description: string;
};

export function AuthShell({ title, description }: AuthShellProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-8">
        <PlaceholderCard
          title="Authentication — Sprint 2"
          description="Login, registration, and role selection will be implemented in module M02."
          moduleId="M02"
        />
      </div>
    </div>
  );
}
