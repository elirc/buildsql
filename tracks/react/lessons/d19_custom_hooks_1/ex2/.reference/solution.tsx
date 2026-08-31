// d19_custom_hooks_1 / ex2 - reference solution.
import { useCallback, useState, type ChangeEvent } from "react";

export function useTextField(initial: string) {
  const [value, setValue] = useState(initial);

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);

  const reset = useCallback(() => {
    setValue(initial);
  }, [initial]);

  // "Has this been edited" is a question about the value, not a separate fact
  // to be maintained - so it cannot drift out of step with the value.
  const dirty = value !== initial;

  return { value, onChange, dirty, reset };
}
