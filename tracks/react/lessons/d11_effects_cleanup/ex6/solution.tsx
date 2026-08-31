// d11_effects_cleanup / ex6 - save 500ms after the typing stops, once.
// See tracks/react/lessons/d11_effects_cleanup/README.md, "Exercise 6".
import { useEffect, useState } from "react";

export function Autosave({ text, save }: { text: string; save: (text: string) => void }) {
  const [savedText, setSavedText] = useState(text);

  useEffect(() => {
    if (text === savedText) {
      return;
    }
    setTimeout(() => {
      save(text);
      setSavedText(text);
    }, 500);
  }, [text, save, savedText]);

  return <p role="status">{text === savedText ? "All changes saved" : "Unsaved changes"}</p>;
}
