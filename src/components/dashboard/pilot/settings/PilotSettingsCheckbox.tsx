type PilotSettingsCheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
};

export function PilotSettingsCheckbox({
  id,
  checked,
  onChange,
  disabled,
  label,
}: PilotSettingsCheckboxProps) {
  return (
    <label className="pilot-settings-checkbox-row" htmlFor={id}>
      <span className="pilot-settings-checkbox-label">{label}</span>
      <input
        id={id}
        type="checkbox"
        className="pilot-settings-checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
