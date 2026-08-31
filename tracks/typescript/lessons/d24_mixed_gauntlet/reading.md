# Reading - typescript/d24_mixed_gauntlet

The debrief. Each section names the topics the problem was mixing, then the
usual three: what it was really testing, the version that looks right, and one
sentence on the model answer.

## Notes

**This set has no theme, which is the theme.** Everything up to here announced
its topic in the title, so you arrived at each problem knowing which tool to
reach for. Real code does not do that, and neither does an interview - the first
and hardest step is recognising which of the things you know applies.

**The recurring pair is "a type derived from data" and "a runtime that agrees
with it".** A frozen rank table and two functions that read it (ex2). A mapped
type with a conditional and a loop that asks the same question (ex3). A
template-literal split and an `indexOf` that cuts at the same place (ex4). A
recursive fold over a tuple and a `for` loop over an array (ex8). In every case
the type and the code are two statements of one fact, and the bug is always that
they drifted.

**The recurring discipline is claiming exactly what you proved.** `S | undefined`
rather than `T | undefined` (ex1). `Command | null` rather than `unknown`
(ex5). `never` for a literal that does not contain a colon (ex4). A `readonly`
state and an `assertNever` default (ex7). None of these change what the code
does; all of them change what the next person can rely on.

**And the recurring shape at the boundary is: check the container, then the
discriminant, then the payload, then rebuild.** ex5 is that pattern written out,
and ex2, ex3 and ex7 are it in miniature. Skipping a step is what turns a type
error into a production incident three modules away.

**Where to go from here.** The drill sets are done; the interview lessons
(`i1`-`i3`) are the timed version of the same material, and the numbered lessons
00-11 are the reference. If any exercise in this set needed more than one hint,
the topic line at the top of its section names the drill to redo - and redoing
one set is a better use of an hour than reading three chapters.

## ex1 - guards plus generics

Topics: type guards (d18) and generic constraints (d10).

What this was testing: that a guard's narrowing can travel out of a function
through its return type. The body is four lines; the exercise is the `S` in
`S | undefined`, which is what turns "I looked for a string" into "I have a
string".

The classic mistake is returning `T | undefined`, which compiles, runs
correctly, and makes every call site narrow again - usually with a cast. The
second is `values.filter(guard)[0]`, which examines every element and allocates
an array to throw away.

The model answer loops and returns on the first acceptance, with `S extends T`
on the signature so the compiler agrees that the narrower type is a legal thing
to promise.

## ex2 - a frozen table, read three ways

Topics: `as const` and `satisfies` (d20), `keyof` and indexed access (d11).

What this was testing: one frozen table producing a name union, a value union,
and two functions that compare through it. The point is that all four artefacts
have a single source of truth, so adding `platinum: 4` is one line and every
type follows.

The classic mistake is the annotation on `RANKS`, and its damage is total here:
`RankName` becomes `string`, `RankValue` becomes `number`, and both functions
accept anything. The second is sorting by name rather than by value, which is
right for this table by accident and wrong for the next one.

The model answer freezes and checks the table, then reads it three times -
twice at the type level and twice at runtime - with exactly one assertion, at
`Object.keys`, where the standard library is deliberately conservative.

## ex3 - a mapped type with a condition in it

Topics: mapped types (d14) and conditional types (d15).

What this was testing: a conditional in a mapped type's value position - the
combination that expresses "change these members, leave those alone" without
listing either group. It is also the first place people meet the rule that a
mapped type is shallow: `nested` keeps its `number` because the map does not
recurse.

The classic mistake is a runtime that converts more than the type says, usually
by testing `!isNaN(Number(entry))` and turning numeric strings into strings
again. The type and the implementation have to ask the same question.

The model answer puts one conditional in the mapped type, one `typeof` in the
loop, and a single assertion where the loop-built object meets the derived type -
which is the only place the compiler cannot follow.

## ex4 - split a literal, at both levels

Topics: template literal types (d17), `infer` (d16).

What this was testing: a type and a function that split the same string the same
way, and the fact that the type-level split is non-greedy for the same reason
`indexOf` is - both stop at the first occurrence. The `"a:b:c"` case in the gate
exists to prove the two agree.

The classic mistake is `event.split(":")` with destructuring, which produces
`["a", "b", "c"]` for the three-part case and quietly loses `"c"`. The second is
a false branch of `{ scope: string; name: string }` instead of `never`, which
lets a string with no colon typecheck as an event.

The model answer captures both halves in one pattern, returns `never` when the
pattern does not match, and uses `indexOf` plus two `slice` calls at runtime so
that the first colon is the separator in both worlds.

## ex5 - unknown in, a union out

Topics: `unknown` (d19), discriminated unions (d07), narrowing (d06).

What this was testing: turning an untrusted value into a type the rest of the
program can narrow on. Everything downstream of this function gets to write
`switch (command.type)` and be told when it forgot a case; that is what the
validation buys.

The classic mistake is returning the input after checking it - `return input as
Command` - which passes every gate here and carries whatever else the payload
had along with it. The second is checking the payload before the discriminant,
which produces confusing behaviour for `{ item: "milk" }` with no type at all.

The model answer rejects the containers that are not objects, casts once, and
then checks discriminant and payload together per branch - returning a fresh
literal each time.

## ex6 - async plus generics

Topics: async typing (d21), generic higher-order functions (d09).

What this was testing: sequential fallback with the type carried through
unchanged, and the difference between a promise and a function that makes one. A
`Promise<T>[]` has already started; a `(() => Promise<T>)[]` has not, and only
the second can be tried in order.

The classic mistake is `return task()` inside the `try`, which returns before the
promise settles so the `catch` never fires and the first failure reaches the
caller. The second is inventing a new error when everything fails, which
discards the only diagnostic information the function had.

The model answer rejects the empty list up front, awaits each task inside a
`try`, remembers the last error as `unknown`, and rethrows it - so the failure
the caller sees is the last one that actually happened.

## ex7 - an exhaustive, immutable reducer

Topics: discriminated unions (d07), `never` and exhaustiveness (d19), readonly
types (d20).

What this was testing: the reducer shape, with the two guarantees that make it
worth using. `readonly` on the state means an accidental `push` does not
compile; `assertNever` in the `default` means an unhandled event type does not
compile either. Neither costs anything at runtime.

The classic mistake is a `quantity` of zero leaving a line with `qty: 0` in the
cart, which is invisible in tests and eventually gets printed on an invoice. The
second is mutating `state.lines` - easy to do, impossible once the type is
`readonly`, which is the argument for making it readonly first.

The model answer branches on the discriminant, rebuilds the lines with `map`,
`filter` or a spread depending on the event, returns the original state
unchanged for the two no-ops, and hands the narrowed-to-`never` event to
`assertNever` in the default.

## ex8 - the pipeline, typed all the way through

Topics: variadic tuples and recursive conditional types (d16), `Awaited` and
async sequencing (d21), rest parameters (d02).

What this was testing: a type that walks a tuple the same way the function walks
an array, one element per step, with `Awaited` normalising each result so a sync
step and an async step are indistinguishable to the next one. It is the same
recursion as `Curried` in d16 ex8, pointed at the result rather than the
parameters.

The classic mistake is unwrapping the promise with a hand-written conditional -
`R extends Promise<infer U> ? U : R` - which is right for one level and wrong for
a step that returns a promise of a promise. The second is forgetting the base
case, so `pipeAsync(x)` with no steps returns `never`.

The model answer recurses on the tail with `Awaited<R>`, falls through to `T`
when the tuple is empty, and runs a plain `for` loop with one `await` at runtime -
and the two casts in the body mark the exact places where a value-level loop
cannot be checked against a type-level fold.

And that is the set, and the track. If ex8 read as a sequence of familiar moves
rather than a puzzle, the twenty-four drill sets did what they were for.

## Further reading

- [Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) - type predicates, discriminated unions and exhaustiveness, which between them cover ex1, ex5 and ex7.
- [Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) - including `infer` and the recursion ex3, ex4 and ex8 are built on.
- [Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) - the loop in ex3, and the modifiers that make ex7 immutable.
- [TypeScript 4.9: the satisfies operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) - the declaration in ex2 that makes the whole exercise work.
- [MDN: Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) - the standard library's answer to ex6, and how it differs.
