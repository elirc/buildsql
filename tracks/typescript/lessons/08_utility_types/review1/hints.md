## Hint 1

The index signature currently says "any string key, number value", which is the
lesson 03 answer. There are exactly three verdicts, so the key set is closed -
and a closed key set deserves a type that says so.

Once it does, the compiler will insist your starting object has all three
members, which is precisely the bug the gate is checking for.

## Hint 2

`Record<Keys, Value>` builds an object type from a union of keys:

```ts
type Flags = Record<"a" | "b", boolean>;   // { a: boolean; b: boolean }
```

With `Record<Verdict, number>` as the return type, `{ pass: 0, fail: 0 }` is a
compile error naming the member you forgot. That is the whole difference
between this and an index signature.

## Hint 3

`ScoreBoard` is `Record<Verdict, number>`. Start from an object with all three
counters at zero, loop the verdicts, and increment.

Left to you: whether a verdict that never appears should be `0` or missing.
This version says `0`, and the type is what forced the decision - which is the
point of the exercise.
