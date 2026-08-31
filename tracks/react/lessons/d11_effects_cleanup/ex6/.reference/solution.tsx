// d11_effects_cleanup / ex6 - reference solution.
import { useEffect, useState } from "react";

export function Autosave({ text, save }: { text: string; save: (text: string) => void }) {
  const [savedText, setSavedText] = useState(text);

  useEffect(() => {
    if (text === savedText) {
      return;
    }
    const id = setTimeout(() => {
      save(text);
      setSavedText(text);
    }, 500);
    return () => clearTimeout(id);
  }, [text, save, savedText]);

  return <p role="status">{text === savedText ? "All changes saved" : "Unsaved changes"}</p>;
}
