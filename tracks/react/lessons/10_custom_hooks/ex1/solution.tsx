// 10_custom_hooks / ex1 - your first custom hook.
// See tracks/react/lessons/10_custom_hooks/README.md, "Exercise 1".
import { useState } from "react";

export function useToggle(
  initial = false,
): [boolean, () => void, (value: boolean) => void] {
  const [on, setOn] = useState(initial);

  return [on, () => {}, setOn];
}
