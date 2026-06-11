export type ProfileStrengthItem = {
  label: string;
  status: "done" | "partial" | "missing";
};

type ProfileStrengthPanelProps = {
  title: string;
  pct: number;
  subtitle: string;
  items: ProfileStrengthItem[];
};

const STATUS_LABEL = {
  done: "DONE",
  partial: "PARTIAL",
  missing: "MISSING",
} as const;

export function ProfileStrengthPanel({
  title,
  pct,
  subtitle,
  items,
}: ProfileStrengthPanelProps) {
  return (
    <aside className="profile-onboarding-sidebar">
      <div className="profile-onboarding-strength-card">
        <h2 className="profile-onboarding-strength-title">{title}</h2>
        <p className="profile-onboarding-strength-pct">{pct}%</p>
        <p className="profile-onboarding-strength-sub">{subtitle}</p>
        <ul className="profile-onboarding-strength-list">
          {items.map((item) => (
            <li key={item.label} className="profile-onboarding-strength-row">
              <span>{item.label}</span>
              <span
                className={`profile-onboarding-strength-pill profile-onboarding-strength-pill--${item.status}`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
