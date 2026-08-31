// d22_render_performance / ex2 - state kept above everything it does not affect.
// See tracks/react/lessons/d22_render_performance/README.md, "Exercise 2".
import { useState } from "react";

function ReportBody({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Quarterly report</p>;
}

export function HelpPanel({ onBodyRender }: { onBodyRender: () => void }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setShowHelp((current) => !current)}>
        {showHelp ? "Hide help" : "Show help"}
      </button>
      {showHelp && <p>Read the manual</p>}
      <ReportBody onRender={onBodyRender} />
    </>
  );
}
