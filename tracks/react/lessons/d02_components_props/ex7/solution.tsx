// d02_components_props / ex7 - a switch, its name, and its description.
// See tracks/react/lessons/d02_components_props/README.md, "Exercise 7".

export function ToggleRow({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby="toggle-description"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      {label}
      <span id="toggle-description">{description}</span>
    </button>
  );
}
