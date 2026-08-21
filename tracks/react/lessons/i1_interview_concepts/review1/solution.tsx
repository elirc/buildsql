// i1_interview_concepts / review1 - "review this effect for me."
// See tracks/react/lessons/i1_interview_concepts/README.md, "Review".
import { useEffect } from "react";

export function ShortcutListener({ onSave }: { onSave: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "s") {
        onSave();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
  });

  return <p>Press s to save</p>;
}
