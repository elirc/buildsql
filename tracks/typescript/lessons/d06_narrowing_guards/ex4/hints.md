## Hint 1

The signature is the whole point:

```ts
export function assertIsRecord(value: unknown): asserts value is Record<string, unknown>
```

An assertion function returns nothing. It communicates failure by throwing, and
success by returning normally - after which the caller's value is narrowed for
the rest of the scope.

## Hint 2

The body is one negated condition and one `throw`. "Plain object" means three
things at once: `typeof value === "object"`, `value !== null`, and not an array.

The message the gate checks is exactly `expected a plain object`.

Left to you: whether to also reject class instances and `Date`s. The prompt does
not ask - but have an opinion about what "plain" should mean in a real parser.
