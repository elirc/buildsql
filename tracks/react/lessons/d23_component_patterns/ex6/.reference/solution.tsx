// d23_component_patterns / ex6 - reference solution.
import { createContext, useContext, type ReactNode } from "react";

// A default of false means a button used outside any toolbar still works,
// which keeps the component usable on its own.
const ToolbarDisabledContext = createContext(false);

export function Toolbar({
  label,
  disabled = false,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <ToolbarDisabledContext.Provider value={disabled}>
      <div role="toolbar" aria-label={label}>
        {children}
      </div>
    </ToolbarDisabledContext.Provider>
  );
}

export function ToolbarButton({
  onClick,
  disabled = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const toolbarDisabled = useContext(ToolbarDisabledContext);

  return (
    <button
      type="button"
      // Either reason is reason enough: the toolbar said so, or this button
      // did. Neither can override the other into being enabled.
      disabled={toolbarDisabled || disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
