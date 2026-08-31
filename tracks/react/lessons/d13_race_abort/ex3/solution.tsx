// d13_race_abort / ex3 - ignoring the answer is not the same as stopping the work.
// See tracks/react/lessons/d13_race_abort/README.md, "Exercise 3".
import { useEffect, useState } from "react";

export function DocumentPane({
  docId,
  fetchDoc,
}: {
  docId: string;
  fetchDoc: (docId: string, signal: AbortSignal) => Promise<string>;
}) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    setText(null);
    setError(null);

    fetchDoc(docId, new AbortController().signal).then(
      (next) => {
        if (!current) return;
        setText(next);
      },
      (reason: unknown) => {
        if (!current) return;
        setError(reason instanceof Error ? reason.message : String(reason));
      },
    );

    return () => {
      current = false;
    };
  }, [docId, fetchDoc]);

  if (error !== null) {
    return <p role="alert">{error}</p>;
  }
  if (text === null) {
    return <p role="status">Loading document {docId}</p>;
  }
  return <p>{text}</p>;
}
