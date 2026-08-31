// d19_custom_hooks_1 / ex8 - reference solution.
import { useCallback, useMemo, useRef, useState } from "react";

export type FormValues = Record<string, string>;

export type FormErrors = Record<string, string>;

export function useForm(initial: FormValues, validate: (values: FormValues) => FormErrors) {
  const [values, setValues] = useState(initial);
  // The form it started as, captured once. The caller may well hand us a fresh
  // object literal on every render, and reset must not follow that around.
  const original = useRef(initial);

  // Errors are a question about the values, so they are computed from them -
  // never stored, never cleared by hand, never out of date. useMemo is what
  // stops that computation running on renders that changed nothing.
  const errors = useMemo(() => validate(values), [values, validate]);

  const setField = useCallback((name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(original.current);
  }, []);

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
    setField,
    reset,
  };
}
