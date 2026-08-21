// 10_custom_hooks / challenge - lessons 06, 07 and 10 in one reusable hook.
// See tracks/react/lessons/10_custom_hooks/README.md, "Challenge".
//
// Contract: `run` must be stable across renders (the caller wraps it in
// useCallback, or defines it outside the component).
import { useState } from "react";

export type AsyncState<T> = {
  status: "loading" | "success" | "error";
  data: T | null;
  error: string | null;
  reload: () => void;
};

export function useAsync<T>(run: () => Promise<T>): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  return { status, data, error, reload: () => {} };
}
