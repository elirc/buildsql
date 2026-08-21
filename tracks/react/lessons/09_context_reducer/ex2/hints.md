## Hint 1
As written, a component rendered outside the provider gets the default value
and renders happily. That is the worst possible outcome for a wiring mistake:
no error, no warning, just the wrong number on somebody's screen. Make the
missing provider impossible to miss.

## Hint 2
Change the default to a value that cannot be mistaken for real data — `null` is
the usual choice — and have the hook check for it:

```tsx
const SettingsContext = createContext<string | null>(null);

export function useSettings(): string {
  const value = useContext(SettingsContext);
  if (value === null) { … }
  return value;
}
```

## Hint 3
Throw an `Error` whose message names the provider the caller forgot, so the
person reading the stack trace at 2am knows what to add and where. Note the
type-level payoff too: after the check, TypeScript narrows the value from
`string | null` to `string`, so every consumer stops having to handle a `null`
that can no longer happen.
