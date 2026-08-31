// d07_conditional_ui / ex8 - reference solution.
import { useState } from "react";

export function ComposeTabs() {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [draft, setDraft] = useState("");

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
          <textarea
            id="draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </>
      ) : (
        <section aria-label="Preview">{draft}</section>
      )}
    </>
  );
}
