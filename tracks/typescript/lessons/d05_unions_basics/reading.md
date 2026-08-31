# Reading - typescript/d05_unions_basics

The debrief. Per problem: what the union was really testing, the mistake most
people make, and one sentence on the model answer.

## Notes

**The skill this set drills is reading a union as a set of possible values.**
`string | number` is not "a thing that is sort of both" - it is "exactly one of
these, and I do not know which". That is why only the members both types share
are available before you narrow, and why every one of these eight problems
begins with a question that identifies which member you have.

**Widening the union is the expensive direction.** Six of these eight functions
would still compile if you added `boolean` or `undefined` to their parameter
type, and every one of them would be worse for it - because a union is a
promise to handle every member, and each new member is a new branch you owe the
caller. The type gate checks the exact unions for that reason: a parameter type
that accepts more than the function handles is a bug waiting for its input.

**`null` and `undefined` are ordinary members.** With `strictNullChecks` on,
`string | null` narrows with `=== null`, `!= null` or a truthiness check, and
the three are not the same: truthiness also removes `""`, which ex6 exists to
punish. `value != null` with the loose `!=` is the one place the style guides
forgive you, because it excludes both nullish values in a single check.

**Coercion is not narrowing.** `Number("2")` turns a string into a number, but
it does not tell you the value *was* a number - and ex3 and ex7 disagree
deliberately about whether the text `"2"` counts. Deciding that question at the
boundary, once, and writing the rule down is most of what a real importer does.

**And the useful shape of a union answer is often several narrow values rather
than one wide one.** ex4 turns one `(string | number)[]` into two clean arrays;
ex8 collapses a column of mixed cells into one label. Both are the same move:
do the narrowing once, at the edge, so nothing downstream has to ask again.

## ex1 - how wide is this cell

What this was testing: `typeof` narrowing on the simplest possible union, and
noticing that the two members need genuinely different arithmetic - a string is
measured in characters, a number in digits.

The classic mistake is `String(value).length` for both, which is right for
strings and wrong for `-12.5`, where the sign and the point are not digits. The
gate includes `-0.5` as well, because dropping the leading zero is the
over-correction.

The model answer narrows with `typeof value === "string"`, returns early, and
then treats the remaining branch as a number - `Math.abs` then removing the
decimal point, which is one line and says what it does.

## ex2 - render a cell

What this was testing: three members where two of them collapse to the same
output. `null` and a blank string are both "empty cell", but they are different
types and only one of them can be trimmed.

The classic mistake is `if (!value) return "-"`, which is short, handles `null`
and `""` in one go, and also swallows `0` - and `0` is a real value that must
render as `"0"`. The gate checks it.

The model answer removes `null` first with an explicit `=== null`, then handles
the number branch, and only then trims - so the truthiness question is asked of
a value that is definitely a string, where it means what you want.

## ex3 - add up only the numbers

What this was testing: that narrowing is a *question about the type*, not a
conversion. `typeof value === "number"` keeps the members that are numbers;
`Number(value)` would manufacture numbers out of strings, which the prompt
explicitly does not want.

The classic mistake is `values.reduce((a, b) => a + Number(b), 0)`, which turns
`"2"` into `2` and `"a"` into `NaN`, and `NaN` then poisons the whole sum.

The model answer is one loop with one `typeof` guard, because the alternative -
`values.filter((v) => typeof v === "number")` - only narrows the element type in
TypeScript 5.5 and later, which is worth knowing but is not something to rely on
in an interview without saying so.

## ex4 - one union array, two narrow arrays

What this was testing: doing the narrowing once and keeping the result. After
the `typeof` check, `push` into a `string[]` is allowed, which is exactly the
payoff - the two output arrays are narrow, so nothing downstream has to ask
again.

The classic mistake is two `filter` passes with casts (`as string[]`), which
works and lies: the cast is doing the job the narrowing should have done, and it
will keep compiling after someone widens the input union.

The model answer walks once and pushes into whichever array the guard selected,
so both arrays are built in input order for free and the `else` branch is
narrowed to `number` without being asked.

## ex5 - two kinds of id

What this was testing: that two members of a union can look identical once
rendered, and that "the same id" is a decision you make rather than one the
language makes for you. `12` and `"12"` compare equal with `==` and unequal with
`===`, and neither answer is automatically right.

The classic mistake is `String(a) === String(b)`, which quietly declares the
number `12` and the text `"12"` to be the same id. That is a defensible design
in some systems - but the prompt asked for the other one, and the gate says so.

The model answer tags the key with the member it came from, which is the same
trick a database uses for a polymorphic foreign key and the same one a
discriminated union will formalise in d07.

## ex6 - drop the nothings

What this was testing: the difference between "nullish" and "falsy". `null` and
`undefined` go; `""` stays; and exactly one of the obvious one-liners gets that
right.

The classic mistake is `values.filter(Boolean)`, which is idiomatic, reads well
and drops the empty string - and, in TypeScript, does not narrow the element
type either, so you end up casting on top of a bug.

The model answer tests `value !== null && value !== undefined` (or the single
`!= null`), which keeps every string and narrows the element type honestly.

## ex7 - parse a row into cells

What this was testing: writing the classification rules down in an order where
each one can assume the earlier ones failed. Order is the whole design: empty
first, then the two literal booleans, then numbers, then text as the fallback.

The classic mistake is checking numbers before booleans (harmless here) or
using `Boolean(text)` for the boolean case, which turns `"false"` into `true`
and every non-empty string into a boolean cell.

The model answer trims once, returns from each rule as it matches, and uses
`Number.isFinite(Number(text))` for the numeric test - because `Number("")` is
`0` and `Number("x")` is `NaN`, and only one of those has already been handled.

## ex8 - what kind is each column

What this was testing: folding a column of union values into a single label,
where the fold has three states - nothing seen yet, one kind seen, more than one
kind seen. That is a tiny state machine, and writing it as one is the answer.

The classic mistake is deciding the column from its first non-null cell, which
is right for the first two cases and silently wrong for the mixed one. The
second-classic is using `rows[0].length` as the width, which is wrong for ragged
input and throws for no rows at all.

The model answer computes the width as the longest row, then walks each column
with a `kind` that starts at `"empty"`, becomes the first kind it sees, and
latches to `"mixed"` the moment a second one shows up.

## Further reading

- [Handbook: Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) - what a union means and why only shared members are available before narrowing.
- [Handbook: Narrowing with typeof](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#typeof-type-guards) - the guard behind six of these eight problems, and the `typeof null` wart.
- [Handbook: Truthiness narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#truthiness-narrowing) - exactly which values a truthiness check removes, which is the ex2 and ex6 trap.
- [MDN: Nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) - nullish against falsy, with the table worth memorising.
- [MDN: Number.isFinite](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite) - and how it differs from the global `isFinite`, which coerces first.
