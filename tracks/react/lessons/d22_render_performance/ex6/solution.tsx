// d22_render_performance / ex6 - starting empty and filling in afterwards.
// See tracks/react/lessons/d22_render_performance/README.md, "Exercise 6".
import { useEffect, useState } from "react";

export function SessionPanel({
  readToken,
  onRender,
}: {
  readToken: () => string;
  onRender: () => void;
}) {
  onRender();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(readToken());
  }, [readToken]);

  return <p role="status">{token === null ? "No session" : `Session ${token}`}</p>;
}
