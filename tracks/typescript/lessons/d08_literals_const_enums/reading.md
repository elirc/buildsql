# Reading - typescript/d08_literals_const_enums

The debrief. Per problem: what the narrow type was really buying, the mistake
that widens it back, and one sentence on the model answer.

## Notes

**The skill this set drills is keeping a type as small as the data.**
`"north" | "east" | "south" | "west"` has four values; `string` has infinitely
many. Every stub here widened one of those sets, and every exercise starts by
shrinking it back - which is the whole reason the type gate marks so much of
this lesson.

**`as const` changes types, not values.** It makes every property `readonly`,
turns every literal into its own literal type, and turns an array literal into a
readonly tuple. Nothing happens at runtime: there is no freeze, no copy, no
cost. That is why `(typeof SHORTCUTS)[number]` works - the tuple type carries
the three literals, and indexing it by `number` unions them back together.

**Derive, do not duplicate.** `type Shortcut = (typeof SHORTCUTS)[number]` and
`type Speed = keyof typeof PRICES` both say "the type is whatever the data
is". A hand-written union next to a hand-written table is two places to forget,
and the compiler cannot tell you when they drift apart.

**Enums are the one construct here that exists at runtime.** A string enum
compiles to an object whose members are their strings - so `Lane.Center` really
is `"center"` in JSON and in a database column. A *numeric* enum compiles to a
two-way object, which is why `Level[20]` is `"Info"` and why `nameOf` is
possible at all. Both are nominal: a bare `"left"` is not a `Lane`, which is
either the feature or the annoyance depending on the day.

**And a literal union is usually the better default.** It has no runtime
footprint, it narrows with plain `===`, it serialises for free, and it plays
well with `keyof`, `Record` and mapped types. Reach for an enum when you want
the nominal barrier or the reverse map - and be able to say which of those you
wanted.

## ex1 - turn right

What this was testing: that a four-value union is a closed set, and that the
compiler will catch `"up"` before your users do. The rotation itself is trivial;
the type is the exercise.

The classic mistake is a `Record<Direction, Direction>` written by hand with one
entry missing - which `Record` will actually catch - or an `if`/`else` chain
whose final `else` returns `"north"` and therefore hides the missing case.

The model answer keeps one ordered array and steps through it with `% 4`, so the
wrap is arithmetic rather than a special case, and adding a fifth point of the
compass would mean editing one line.

## ex2 - a type derived from a list

What this was testing: `as const` on an array, and the `(typeof X)[number]`
idiom that turns a tuple type into a union of its elements. Without `as const`
the array is `string[]` and the derived type is `string`, which is exactly what
the stub does.

The classic mistake is `SHORTCUTS.includes(value)`, which does not compile once
the array is a readonly tuple of literals - `includes` wants an argument of the
element type, and `value` is a `string`. One widening cast
(`(SHORTCUTS as readonly string[]).includes(value)`) is the accepted answer, and
saying out loud why it is safe is the point.

The model answer derives the type from the data, writes the guard as a
predicate, and returns `indexOf` for the position - all three reading from the
same single list.

## ex3 - a string enum

What this was testing: that a string enum is nominal and that its members are
their strings at runtime. The type gate rejects `laneOffset("left")` even though
`Lane.Left` *is* `"left"` once compiled, and that gap is the whole personality
of enums.

The classic mistake, once the enum is back, is clamping with `%` instead of
`Math.min`/`Math.max` - lanes do not wrap, and `shift(Lane.Right, 5)` must stay
on the right rather than reappearing on the left.

The model answer keeps one ordered array of members, uses `indexOf` for the
offset, and clamps the shifted index into range before reading it back - so both
functions share one definition of the ordering.

## ex4 - a numeric enum, and its reverse map

What this was testing: the one thing a numeric enum gives you that nothing else
here does. `enum Level { Info = 20 }` compiles to an object with both
`Level.Info === 20` and `Level[20] === "Info"`, and `nameOf` is a one-line
lookup because of it.

The classic mistake is trying the same trick with a string enum or with a plain
`as const` object, neither of which has a reverse mapping - you would have to
build one, which is exactly the work the enum did for you.

The model answer compares with `>=`, which works because the members are numbers
in a deliberate order, and returns `Level[level]` for the name - and the reason
the numbers are 10, 20, 30, 40 rather than 0, 1, 2, 3 is so a level can be
inserted between two of them later.

## ex5 - keyof typeof over a const table

What this was testing: the two-step move that turns a value into a type.
`typeof PRICES` is the type of the object; `keyof` that is the union of its
keys; and `as const` is what stops the values widening to `number` on the way.

The classic mistake is hard-coding the cheapest speed. The gate cannot tell the
difference today, but the exercise says "computed from the table", and a
hard-coded answer is a bug the moment a price changes - which is the entire
argument for deriving types from data in the first place.

The model answer iterates `Object.keys(PRICES)` with one cast to `Speed[]` -
because `Object.keys` is typed `string[]` on purpose, since a value may always
carry more properties than its type declares.

## ex6 - two unions, one sku

What this was testing: narrowing a `string` back down to a literal union, which
is what every parser at a system boundary has to do. `text.split("-")` gives you
`string`s, and only an explicit comparison against each literal turns one into a
`Size`.

The classic mistake is `size as Size`, which compiles, skips the check, and
returns `{ size: "xl" }` typed as if it were valid. The cast is the bug; the
comparison chain is the fix.

The model answer rejects the wrong number of parts first, then checks each half
against its literals - and because the checks are `!==` chains, the value is
narrowed by the time the object literal is built, with no cast anywhere.

## ex7 - a transition table over a literal union

What this was testing: `Record<Light, Light>` as an exhaustive table - leave a
lamp out and the object literal will not compile - plus the modulo arithmetic
that JavaScript gets wrong for negative numbers.

The classic mistake is `steps % 3` for a negative `steps`, which is negative in
JavaScript (`-1 % 3` is `-1`, not `2`) and produces an index off the front of the
array. `((n % len) + len) % len` is the idiom worth memorising.

The model answer normalises the step count once, then walks the table that many
times - so the table stays the only description of the cycle and the direction
is handled by arithmetic rather than by a second, reversed table.

## ex8 - two unions that make a week

What this was testing: composing a union from two named halves, and using a type
predicate to get back to one of them. `isWeekend(day): day is Weekend` is what
makes the `else` branch a `Weekday` and lets `nextWorkday` promise that return
type honestly.

The classic mistake is typing `nextWorkday` as returning `Day` because
narrowing "felt hard" - the whole point of the predicate is that the compiler
will do it for you, and the type gate checks the narrower return.

The model answer shares one seven-element ordering between `shiftDay` and
`nextWorkday`, uses the same double-modulo as ex7 for negatives, and finds the
next working day by stepping forward and returning from inside the narrowed
branch.

## Further reading

- [Handbook: Literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) - literal unions, widening, and why `const` and `let` infer differently.
- [Handbook: const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) - what `as const` does to arrays, objects and literals.
- [Handbook: Enums](https://www.typescriptlang.org/docs/handbook/enums.html) - string enums, numeric enums, the reverse mapping, and the section on `const enum` caveats.
- [Handbook: keyof and typeof](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) - the `keyof typeof` pairing that ex5 is built on.
- [MDN: Remainder operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder) - why `-1 % 3` is `-1`, which is the ex7 and ex8 trap.
