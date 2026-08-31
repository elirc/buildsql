// d11_effects_cleanup / ex1 - subscribe on the way in, unsubscribe on the way out.
// See tracks/react/lessons/d11_effects_cleanup/README.md, "Exercise 1".
import { useEffect, useState } from "react";

type Subscribe = (onNames: (names: string[]) => void) => () => void;

export function PresenceList({ subscribe }: { subscribe: Subscribe }) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    subscribe(setNames);
  }, [subscribe]);

  return (
    <ul>
      {names.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
