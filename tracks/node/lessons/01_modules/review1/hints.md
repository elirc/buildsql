## Hint 1

Same shape as ex3: two functions that have to agree about state neither of
them is given, so the state lives at module scope and survives for as long as
the process does.

What changed is the question. You are not counting - you are answering "have I
seen this exact string before?", which is a membership test.

## Hint 2

A `Set<string>` at module scope answers membership in one call and keeps its
own count in `.size`, which is exactly what `seenCount()` has to report.

Order matters inside `firstTimeSeeing`: check membership *before* you add,
because after the add every token looks familiar. Work out the answer first,
then record the sighting.

## Hint 3

```ts
const seen = new Set<string>();

export function firstTimeSeeing(token: string): boolean {
  if (seen.has(token)) return /* ? */;
  seen.add(token);
  return /* ? */;
}
```

The decision left to you is `seenCount()`: a `Set` already knows how many
distinct values it holds, so this is a property access, not a loop. If you
reach for an array instead, remember the gate feeds a duplicate and expects
the count not to move.
