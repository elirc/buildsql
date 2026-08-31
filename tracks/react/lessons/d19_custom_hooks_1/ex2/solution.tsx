// d19_custom_hooks_1 / ex2 - a dirty flag that can only ever go one way.
// See tracks/react/lessons/d19_custom_hooks_1/README.md, "Exercise 2".
import { useState, type ChangeEvent } from "react";

export function useTextField(initial: string) {
  const [value, setValue] = useState(initial);
  const [dirty, setDirty] = useState(false);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
    setDirty(true);
  }

  function reset() {
    setValue(initial);
  }

  return { value, onChange, dirty, reset };
}
