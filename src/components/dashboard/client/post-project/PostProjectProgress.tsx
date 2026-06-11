import { POST_PROJECT_STEPS } from "@/lib/client/post-project";
import { cn } from "@/lib/utils";

type PostProjectProgressProps = {
  currentStep: number;
};

export function PostProjectProgress({ currentStep }: PostProjectProgressProps) {
  return (
    <nav
      className="client-post-project-progress"
      aria-label="Project posting progress"
    >
      <ol className="client-post-project-progress-list">
        {POST_PROJECT_STEPS.map((step, index) => {
          const active = index === currentStep;
          const complete = index < currentStep;
          const reached = complete || active;

          return (
            <li
              key={step.id}
              className={cn(
                "client-post-project-progress-item",
                active && "client-post-project-progress-item--active",
                complete && "client-post-project-progress-item--complete",
              )}
            >
              <span
                className={cn(
                  "client-post-project-progress-bar",
                  reached && "client-post-project-progress-bar--reached",
                )}
                aria-hidden
              />
              <span className="client-post-project-progress-label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
