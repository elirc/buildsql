// 10_custom_hooks / ex1 - reference solution.
import { useCallback, useState } from "react";

export function useToggle(
  initial = false,
): [boolean, () => void, (value: boolean) => void] {
  const [on, setOn] = useState(initial);

  const toggle = useCallback(() => {
    setOn((previous) => !previous);
  }, []);

  return [on, toggle, setOn];
}
