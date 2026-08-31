// d22_render_performance / ex2 - reference solution.
import { useState } from "react";

function ReportBody({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Quarterly report</p>;
}

// The flag now lives in the smallest component that needs it, so the renders
// it causes reach exactly as far as the thing it decides.
function HelpToggle() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setShowHelp((current) => !current)}>
        {showHelp ? "Hide help" : "Show help"}
      </button>
      {showHelp && <p>Read the manual</p>}
    </>
  );
}

export function HelpPanel({ onBodyRender }: { onBodyRender: () => void }) {
  // No state at all here now, so nothing makes this component render again -
  // and the report below is never disturbed.
  return (
    <>
      <HelpToggle />
      <ReportBody onRender={onBodyRender} />
    </>
  );
}
