// d11_effects_cleanup / ex7 - reference solution.
import { useEffect } from "react";

export function SessionKeeper({ connect }: { connect: () => () => void }) {
  useEffect(() => {
    const close = connect();
    return close;
  }, [connect]);

  return <p role="status">Session open</p>;
}
