// d11_effects_cleanup / ex7 - an effect that can be run twice without harm.
// See tracks/react/lessons/d11_effects_cleanup/README.md, "Exercise 7".
import { useEffect } from "react";

export function SessionKeeper({ connect }: { connect: () => () => void }) {
  useEffect(() => {
    connect();
  }, [connect]);

  return <p role="status">Session open</p>;
}
