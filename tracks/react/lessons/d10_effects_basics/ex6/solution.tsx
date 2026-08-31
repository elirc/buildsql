// d10_effects_basics / ex6 - a function prop that is new on every render.
// See tracks/react/lessons/d10_effects_basics/README.md, "Exercise 6".
import { useEffect, useState } from "react";

export function Loader({ id, load }: { id: string; load: (id: string) => Promise<string> }) {
  const [text, setText] = useState("Loading");

  useEffect(() => {
    let current = true;
    load(id).then((value) => {
      if (current) {
        setText(value);
      }
    });
    return () => {
      current = false;
    };
  }, [id, load]);

  return <p role="status">{text}</p>;
}
