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
    <label className="client-settings-toggle-wrap" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="client-settings-toggle-input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="client-settings-toggle-track" aria-hidden />
    </label>
  );
}
