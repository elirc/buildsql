// d07_conditional_ui / ex8 - the branch goes away and takes the draft with it.
// See tracks/react/lessons/d07_conditional_ui/README.md, "Exercise 8".
import { useState } from "react";

export function ComposeTabs() {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <>
      <button type="button" aria-pressed={tab === "write"} onClick={() => setTab("write")}>
        Write
      </button>
      <button type="button" aria-pressed={tab === "preview"} onClick={() => setTab("preview")}>
        Preview
      </button>
      {tab === "write" ? (
        <>
          <label htmlFor="draft">Draft</label>
          <textarea id="draft" defaultValue="" />
        </>
      ) : (
        <section aria-label="Preview">Nothing to preview</section>
      )}
    </>
  );
}
