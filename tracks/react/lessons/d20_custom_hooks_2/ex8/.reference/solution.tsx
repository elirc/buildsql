// d20_custom_hooks_2 / ex8 - reference solution.
import { useCallback, useEffect, useRef, useState } from "react";

export function useControllableState<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;

  // Decided once, on the first render, and never revisited: a component that
  // changes from controlled to uncontrolled halfway through its life is a
  // component whose value appears to jump for no reason.
  const controlled = useRef(value !== undefined).current;

  // Kept whether or not it is used, because the number of hooks a component
  // calls may not depend on a prop.
  const [internal, setInternal] = useState(defaultValue);

  const latestOnChange = useRef(onChange);
  useEffect(() => {
    latestOnChange.current = onChange;
  });

  const set = useCallback(
    (next: T) => {
      // When the parent is in charge, asking is all we may do. Keeping a copy
      // as well is what makes a "controlled" component disagree with the parent
      // that is controlling it.
      if (!controlled) setInternal(next);
      latestOnChange.current?.(next);
    },
    [controlled],
  );

  return [controlled ? (value as T) : internal, set];
}
