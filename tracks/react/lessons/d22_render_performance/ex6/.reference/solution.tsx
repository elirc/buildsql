// d22_render_performance / ex6 - reference solution.
import { useState } from "react";

export function SessionPanel({
  readToken,
  onRender,
}: {
  readToken: () => string;
  onRender: () => void;
}) {
  onRender();
  // The token is available synchronously, so there is no reason for a render
  // in which it is missing. Passing the function - not calling it - means
  // React runs it once, before the first render, and never again.
  const [token] = useState(readToken);

  return <p role="status">Session {token}</p>;
}
