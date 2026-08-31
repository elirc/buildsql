// d11_effects_cleanup / ex1 - reference solution.
import { useEffect, useState } from "react";

type Subscribe = (onNames: (names: string[]) => void) => () => void;

export function PresenceList({ subscribe }: { subscribe: Subscribe }) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe(setNames);
    return unsubscribe;
  }, [subscribe]);

  return (
    <ul>
      {names.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
