type ClientSettingsToggleProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function ClientSettingsToggle({
  id,
  checked,
  onChange,
  disabled,
}: ClientSettingsToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`client-settings-toggle${checked ? " client-settings-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="client-settings-toggle-thumb" aria-hidden />
    </button>
  );
}
