// 10_custom_hooks / challenge - reference solution.
import { useCallback, useEffect, useState } from "react";

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
  const [attempt, setAttempt] = useState(0);

  const reload = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let current = true;
    setStatus("loading");
    setError(null);

    run()
      .then((result) => {
        if (!current) {
          return;
        }
        setData(result);
        setStatus("success");
      })
      .catch((problem: unknown) => {
        if (!current) {
          return;
        }
        setError(problem instanceof Error ? problem.message : "Something went wrong");
        setStatus("error");
      });

    return () => {
      current = false;
    };
  }, [run, attempt]);

  return { status, data, error, reload };
}
