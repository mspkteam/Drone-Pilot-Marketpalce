import { LocationPinIcon, PlusIcon } from "@/components/dashboard/client/post-project/PostProjectIcons";
import {
  emptyPostProjectLocation,
  type PostProjectFormState,
  type PostProjectLocation,
} from "@/lib/client/post-project";

type PostProjectStepLocationProps = {
  form: PostProjectFormState;
  onChange: (locations: PostProjectLocation[]) => void;
};

export function PostProjectStepLocation({ form, onChange }: PostProjectStepLocationProps) {
  function updateLocation(index: number, patch: Partial<PostProjectLocation>) {
    onChange(
      form.locations.map((loc, i) => (i === index ? { ...loc, ...patch } : loc)),
    );
  }

  function addLocation() {
    onChange([...form.locations, emptyPostProjectLocation()]);
  }

  return (
    <div className="client-post-project-step">
      <h2 className="client-post-project-step-title">Where is the project located?</h2>
      <p className="client-post-project-step-subtitle">
        Add one or more sites you need covered.
      </p>

      <div className="client-post-project-location-list">
        {form.locations.map((location, index) => (
          <article key={index} className="client-post-project-location-card">
            <header className="client-post-project-location-header">
              <span className="client-post-project-location-icon" aria-hidden>
                <LocationPinIcon />
              </span>
              <span className="client-post-project-location-label">
                Location {index + 1}
              </span>
            </header>

            <div className="client-post-project-fields">
              <label className="client-post-project-field client-post-project-field--full">
                <span className="client-post-project-field-label">Project Address</span>
                <input
                  type="text"
                  className="client-post-project-input"
                  placeholder="123 Main Street"
                  value={location.address}
                  onChange={(e) => updateLocation(index, { address: e.target.value })}
                />
              </label>

              <div className="client-post-project-field-row client-post-project-field-row--3">
                <label className="client-post-project-field">
                  <span className="client-post-project-field-label">City</span>
                  <input
                    type="text"
                    className="client-post-project-input"
                    placeholder="Details"
                    value={location.city}
                    onChange={(e) => updateLocation(index, { city: e.target.value })}
                  />
                </label>
                <label className="client-post-project-field">
                  <span className="client-post-project-field-label">Country</span>
                  <input
                    type="text"
                    className="client-post-project-input"
                    placeholder="United States"
                    value={location.country}
                    onChange={(e) => updateLocation(index, { country: e.target.value })}
                  />
                </label>
                <label className="client-post-project-field">
                  <span className="client-post-project-field-label">State</span>
                  <input
                    type="text"
                    className="client-post-project-input"
                    placeholder="State"
                    value={location.state}
                    onChange={(e) => updateLocation(index, { state: e.target.value })}
                  />
                </label>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="client-post-project-add-location"
        onClick={addLocation}
      >
        <PlusIcon />
        Add another location
      </button>
    </div>
  );
}
