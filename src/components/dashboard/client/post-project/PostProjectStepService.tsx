import { ServiceIcon } from "@/components/dashboard/client/post-project/PostProjectIcons";
import {
  POST_PROJECT_SERVICES,
  type PostProjectFormState,
  type PostProjectServiceId,
} from "@/lib/client/post-project";
import { cn } from "@/lib/utils";

type PostProjectStepServiceProps = {
  form: PostProjectFormState;
  onSelect: (serviceId: PostProjectServiceId) => void;
};

export function PostProjectStepService({ form, onSelect }: PostProjectStepServiceProps) {
  return (
    <div className="client-post-project-step">
      <h2 className="client-post-project-step-title">What do you need help with?</h2>
      <p className="client-post-project-step-subtitle">
        Choose the service that best matches your project.
      </p>

      <div className="client-post-project-service-grid" role="radiogroup" aria-label="Service type">
        {POST_PROJECT_SERVICES.map((service) => {
          const selected = form.serviceId === service.id;
          return (
            <button
              key={service.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                "client-post-project-service-option",
                selected && "client-post-project-service-option--selected",
              )}
              onClick={() => onSelect(service.id)}
            >
              <span className="client-post-project-service-icon" aria-hidden>
                <ServiceIcon />
              </span>
              <span className="client-post-project-service-label">{service.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
