// d13_race_abort / ex3 - reference solution.
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
    // One controller per run of the effect. Its signal goes out with the
    // request; the cleanup aborts it, which both stops the work and tells the
    // callbacks below that this run has been retired.
    const controller = new AbortController();
    setText(null);
    setError(null);

    fetchDoc(docId, controller.signal).then(
      (next) => {
        if (controller.signal.aborted) return;
        setText(next);
      },
      (reason: unknown) => {
        // An abort we asked for arrives here as a rejection. It is not news.
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : String(reason));
      },
    );

    return () => {
      controller.abort();
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
