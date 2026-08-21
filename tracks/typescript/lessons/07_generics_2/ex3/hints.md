## Hint 1

A class takes type parameters exactly where an interface does - right after the
name. Once `Registry<T>` exists, the internal `Map`, the `set` parameter and the
`get` return type all refer to `T` instead of `unknown`.

Then read the gate's `new Registry()` line, with no type argument at all. That
call has to keep working.

## Hint 2

```ts
export class Store<T = string> {
  private readonly items = new Map<string, T>();
}
```

`= string` is a *default type argument*: `new Store()` means `Store<string>`,
while `new Store<number>()` overrides it. Defaults have to come after any
parameters without defaults, exactly like value defaults.

`get` returns `T | undefined`, because a `Map` lookup can miss - and pretending
otherwise is the bug this exercise is really about.

## Hint 3

Declare `class Registry<T = string>`, store `Map<string, T>`, and delegate the
four members to the map: `set`, `get` (returning `T | undefined`), `has`, and a
`size` getter returning `this.entries.size`.

Left to you: whether `entries` stays `private readonly`. Try removing
`private` and think about what a caller could then do to your invariants -
`readonly` on a `Map` field stops reassignment, not mutation.
