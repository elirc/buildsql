// d15_ref_patterns / ex4 - one subscription, a callback that keeps changing.
// See tracks/react/lessons/d15_ref_patterns/README.md, "Exercise 4".
import { useEffect, useState } from "react";

export function PingMonitor({
  subscribe,
  onMessage,
}: {
  subscribe: (handler: (message: string) => void) => () => void;
  onMessage: (message: string) => void;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      onMessage(message);
      setCount((current) => current + 1);
    });
    return unsubscribe;
  }, [subscribe, onMessage]);

  return <p role="status">Messages: {count}</p>;
}
