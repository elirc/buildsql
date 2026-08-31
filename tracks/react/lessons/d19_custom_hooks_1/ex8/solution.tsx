// d19_custom_hooks_1 / ex8 - errors kept in state, and updated nowhere.
// See tracks/react/lessons/d19_custom_hooks_1/README.md, "Exercise 8".
import { useState } from "react";

export type FormValues = Record<string, string>;

export type FormErrors = Record<string, string>;

export function useForm(initial: FormValues, validate: (values: FormValues) => FormErrors) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FormErrors>(() => validate(initial));

  function setField(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function reset() {
    setValues(initial);
    setErrors(validate(initial));
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
    setField,
    reset,
  };
}
