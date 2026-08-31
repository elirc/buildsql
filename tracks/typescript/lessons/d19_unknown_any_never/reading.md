# Reading - typescript/d19_unknown_any_never

The debrief. Per problem: which of the three types was really at issue, the
version that runs correctly and lies, and one sentence on the model answer.

## Notes

**The three types sit at the two ends of the scale and outside it.** `unknown`
is the top: everything is assignable *to* it, and it is assignable to nothing,
so holding one obliges you to prove something before you use it. `never` is the
bottom: nothing is assignable to it, and it is assignable to everything, which
is why a `never`-returning function can appear wherever a value is expected.
`any` is not on the scale at all - it is assignable in both directions to
everything, which is another way of saying the compiler has agreed to stop
looking.

**`unknown` is the correct type at every boundary.** JSON you just parsed (ex1),
a value pulled from a heterogeneous store (ex4), a step in a path walk (ex6), a
document you are about to validate (ex7). The pattern is always the same: take
`unknown` in, narrow with `typeof` or a guard, hand back a type that says what
you proved. The alternative - accepting `any` and hoping - produces code that
compiles identically and fails differently.

**`any` spreads.** It is not confined to the variable that holds it: every
property read, call and arithmetic operation on an `any` produces another
`any`, so one untyped import can quietly disable checking across a module. Two
stubs in this set return `any` for exactly that reason, and the type gate is
the only thing that notices.

**`never` has three jobs, and they look unrelated until they do not.** As a
*parameter* type it means "this can only be called with something that cannot
exist", which is the exhaustiveness check (ex3). As a *return* type it means
"this does not come back", which drives reachability analysis and lets `fail()`
narrow the code after it (ex8). As a *member* type it means "there is nothing
here", which in a mapped type's key position deletes the member (ex5). All
three are the same fact - the type has no values - read in three positions.

**And the compiler will not check your honesty.** A predicate, a `never` return
and an `asserts` signature are all claims it takes on trust. That is why this
lesson runs two gates: one to check that the code does the right thing, and one
to check that the signature says so.

## ex1 - parse into unknown

What this was testing: that `any` is not contained by the variable that holds
it - it spreads through every expression it touches - and that a one-word
change to a return type is what stops it. `unknown` is assignable from
everything and usable as nothing, which is precisely what a freshly parsed
payload deserves.

The classic mistake is leaving the return type off entirely and letting `any`
escape, or wrapping the call in a try/catch that returns `null` - which makes
"the document said null" and "the document was corrupt" the same result.

The model answer is one line, and its whole value is in the signature: after
this function, the parsed value can only be used by proving something about it
first.

## ex2 - unknown in, number or null out

What this was testing: narrowing `unknown` with `typeof` before touching the
value, and the handful of JavaScript coercions that make "convert this to a
number" harder than it looks. The signature `unknown -> number | null` is the
shape every boundary parser wants: nothing in, a decision out.

The classic mistake is `Number(value)` on its own. It turns `""` into `0`,
`null` into `0`, `true` into `1` and `[]` into `0`, so a function built on it
reports success for four values that were never numbers. The second is
returning `NaN` as a result rather than as a failure - `NaN` is a `number` as
far as the type system is concerned, and it will travel a long way.

The model answer branches on `typeof`, uses `Number.isFinite` as the single
validity test on both paths, and returns `null` for everything it was not asked
about.

## ex3 - never as the exhaustiveness check

What this was testing: `never` as a compile-time claim rather than a runtime
one. The switch narrows the discriminant case by case, and if it covered
everything then the `default` branch sees `never`; add a fifth status to the
union and that branch suddenly sees the new member, which is a type error at
the call to `assertUnreachable`.

The classic mistake is typing the parameter `unknown` or `any`, which compiles
forever and turns the safety net into a comment. The second is throwing a bare
message with no value in it, which is the one piece of information the person
reading the log actually needs.

The model answer is four `return`s and a `default` that hands the narrowed
discriminant to a `never`-typed parameter - and returns its `never` result, so
the compiler knows the switch is total.

## ex4 - an untyped store with a typed door

What this was testing: `unknown` as the *right* type for a heterogeneous store,
with the type recovered at the point of use rather than at the point of
storage. It is the same idea as `parseJson` in ex1, applied to a container.

The classic mistake is `Map<string, any>`, which makes `get` return `any` and
lets every caller do whatever it likes with a value nobody checked. The second
is a `get<T>(key: string): T | null` with a cast inside - a signature that lets
the caller *name* a type without proving anything, which is worse than `any`
because it looks safe.

The model answer keeps `unknown` in the map, takes the guard as a parameter,
and returns `T | null` - so the only way to get a typed value out is to hand
in the proof.

## ex5 - never as a filter

What this was testing: `never` in its third role - not "this function does not
return" and not "this cannot happen", but "there is nothing here", which in a
mapped type's key position means *delete this member*.

The classic mistake is writing the conditional's branches the wrong way round,
which produces an object with only the impossible members left. The second is
reaching for `Omit` with a hand-listed key union, which cannot see which
members are `never` and has to be maintained by hand.

The model answer is one key remap whose new key is `never` for the members to
drop, and the `undefined` case in the gate is there to make the distinction
concrete: `undefined` is a type with one value, `never` is a type with none.

## ex6 - walk a path through unknown

What this was testing: keeping `unknown` honest across a loop. Each iteration
throws away what the previous one proved, so the checks have to live inside the
loop - and the return type stays `unknown` because the function genuinely does
not know what it found.

The classic mistake is the stub's `any` return, which makes every call site
compile and none of them safe. The second is checking `typeof current ===
"object"` without the `null` test, which throws on the first missing branch of
a config file.

The model answer re-checks the container and the key on every step and casts
exactly once per step, at the index - so the only unproved claim in the
function is the one line where the check just above it is the proof.

## ex7 - narrow unknown to JSON

What this was testing: a recursive type and a recursive guard that mirror each
other, which is the shape of every hand-written validator. The type says what
JSON is; the guard proves it one node at a time; the predicate connects the two.

The classic mistake is checking `typeof value === "object"` before ruling out
`null` and arrays, which either rejects `null` (wrong) or walks into an array
as if it were a record (also wrong). The second is forgetting that
`Object.values({ a: undefined })` contains `undefined`, so the recursion is what
catches a value JSON cannot represent.

The model answer orders the checks null, primitives, array, object, and recurses
with `every` - so an empty array and an empty object both pass vacuously, and a
single bad leaf fails everything above it.

## ex8 - a function that never returns

What this was testing: `never` as a control-flow signal. A function returning
`never` tells the compiler's reachability analysis that the code after it does
not run - which is what turns a validation helper into something you can call
in an expression position and rely on for narrowing afterwards.

The classic mistake is declaring `fail` as returning `void`, which compiles and
then forces a `throw` at every call site anyway: the branch after it is still
considered reachable, so the function around it is missing a return. The type
gate has a small function whose only purpose is to catch that.

The model answer types `fail` as `never` and validates once with a `||` chain
ordered so that each operand is legal on the narrowed type - after which the
final `return value` needs no assertion, because the compiler has already
worked out that the failing path did not come back.

## Further reading

- [Handbook: unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown) - the top type, and why it is the right parameter type for a value you have not checked.
- [Handbook: never](https://www.typescriptlang.org/docs/handbook/2/functions.html#never) - the bottom type, in both its parameter and return-type roles.
- [Handbook: Narrowing - exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking) - the `assertUnreachable` pattern from ex3, written out.
- [MDN: JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) - what it returns, what it throws, and what JSON can represent (ex1 and ex7).
- [MDN: Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/Number) - the coercion table behind every trap in ex2.
