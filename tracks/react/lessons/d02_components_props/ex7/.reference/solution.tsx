// d02_components_props / ex7 - reference solution.
import { useId } from "react";

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
  const descriptionId = useId();

  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description === undefined ? undefined : descriptionId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        {label}
      </button>
      {description === undefined ? null : <p id={descriptionId}>{description}</p>}
    </div>
  );
}
