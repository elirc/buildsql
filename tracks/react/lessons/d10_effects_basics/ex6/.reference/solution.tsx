// d10_effects_basics / ex6 - reference solution.
import { useEffect, useRef, useState } from "react";

export function Loader({ id, load }: { id: string; load: (id: string) => Promise<string> }) {
  const [text, setText] = useState("Loading");
  const latestLoad = useRef(load);

  useEffect(() => {
    latestLoad.current = load;
  });

  useEffect(() => {
    let current = true;
    latestLoad.current(id).then((value) => {
      if (current) {
        setText(value);
      }
    });
    return () => {
      current = false;
    };
  }, [id]);

  return <p role="status">{text}</p>;
}
