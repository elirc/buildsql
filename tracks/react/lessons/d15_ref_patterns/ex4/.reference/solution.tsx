// d15_ref_patterns / ex4 - reference solution.
import { useEffect, useRef, useState } from "react";

export function PingMonitor({
  subscribe,
  onMessage,
}: {
  subscribe: (handler: (message: string) => void) => () => void;
  onMessage: (message: string) => void;
}) {
  const [count, setCount] = useState(0);
  // The newest callback, kept somewhere React does not compare. The
  // subscription reads it at the moment a message arrives rather than closing
  // over the one that existed when it was opened.
  const latest = useRef(onMessage);

  useEffect(() => {
    latest.current = onMessage;
  });

  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      latest.current(message);
      setCount((current) => current + 1);
    });
    return unsubscribe;
  }, [subscribe]);

  return <p role="status">Messages: {count}</p>;
}
