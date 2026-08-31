// d24_mixed_gauntlet / ex4 - reference solution (author only).

export type EventOf<S extends string> = S extends `${infer Scope}:${infer Name}`
  ? { scope: Scope; name: Name }
  : never;

export function splitEvent<S extends string>(event: S): EventOf<S> {
  const separator = event.indexOf(":");
  if (separator === -1) {
    throw new TypeError("splitEvent: expected a colon in " + event);
  }
  return {
    scope: event.slice(0, separator),
    name: event.slice(separator + 1),
  } as EventOf<S>;
}
