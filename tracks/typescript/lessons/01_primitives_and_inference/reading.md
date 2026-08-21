# Reading - typescript/01_primitives_and_inference

Read this after you have attempted the exercises. Everything below is the
*why* behind the problems you just solved, plus the parts that get asked about
in interviews.

## Notes

**Widening is the rule you did not know you were using.** When TypeScript
infers a type for a mutable binding it *widens* the literal to its base type:
`let mode = "dark"` is `string`, not `"dark"`, because you are allowed to
assign something else to it tomorrow. A `const` cannot be reassigned, so no
widening is needed and the inferred type stays `"dark"`. This is the single
most surprising inference rule for newcomers, and it explains a bug you will
hit in lesson 05: passing `let mode = "dark"` to a function expecting
`"dark" | "light"` fails, while passing the `const` succeeds. The fix is
either a `const`, an annotation, or `as const` — all three say the same thing
in different registers.

**Arrays and tuples are the same value with different promises.** At runtime
`[1, 10]` is one object either way; nothing is emitted for the type. What
changes is what the compiler will let you do. `number[]` says "any length,
homogeneous, every index means the same thing", so `values[7]` typechecks and
hands you `number` even when the array holds two items. `[low: number, high:
number]` says "exactly two, and they mean different things", so `values[7]` is
a compile error and `const [low, high] = bounds()` names both slots. Under
`noUncheckedIndexedAccess` — off in this course, on in some strict codebases —
even `number[]` indexing hands you `number | undefined`, which is the honest
answer and an enormous amount of ceremony.

**`readonly` is a compile-time promise, not `Object.freeze`.** `readonly
number[]` (spelled `ReadonlyArray<number>` in older code) removes the mutating
methods from the type — `push`, `pop`, `sort`, `splice`, `reverse` — while
leaving `map`, `filter`, `slice` and `concat`, which all return new arrays.
Nothing is frozen at runtime; a cast or a plain JavaScript caller can still
mutate it. Think of it as documentation the compiler enforces on the code it
can see. As a parameter type it is strictly better than `number[]`: it accepts
more callers and promises more to them. As a *return* type it is the opposite —
handing back `readonly number[]` forces every caller to copy before sorting.

**Where annotations actually pay.** Annotate function parameters (mandatory
under `noImplicitAny`), exported function return types (so a refactor inside
the body cannot silently change the public contract), and empty containers
(`const rows: Row[] = []` — without it you get `any[]`, or `never[]` in some
positions). Skip them on locals initialised from an expression, on arrow
callbacks passed to `map`/`filter` where contextual typing already knows the
element type, and on anything where the annotation would just repeat the right
hand side.

## ex1 — a return type that is true

The gate asserts two unrelated facts: that the arithmetic is right, and that
the declared return type is `number`. Both were failing before you started, and
they were failing for different reasons. That separation is the whole reason
this track runs two gate files.

The empty-list case is not pedantry. `[].reduce((a, b) => a + b)` throws
outright, `0 / 0` is `NaN`, and `NaN` propagates silently through every
arithmetic operation downstream until it lands in a UI as "NaN%". TypeScript
cannot help: `NaN` is a perfectly good `number` as far as the type system is
concerned, and always will be. It is the clearest small example of the line
between what types check (shape) and what tests check (behaviour).

One more thing worth noticing: once you wrote `: number`, the annotation began
checking the *body*. Try returning `scores` from inside it and read the error —
the annotation is not decoration, it is a constraint pointed inward at your own
code, which is exactly what makes it worth writing on exported functions.

## ex2 — a pair is not an array

`number[]` and `[number, number]` are both arrays at runtime and the difference
is entirely in what the compiler will allow. The gate's index-2 probe makes the
point sharply: with a tuple, `minMax([1, 2])[2]` is a compile error, and with
`number[]` it is a `number` that does not exist. That is a real production bug
class — reading `result[2]` from a "pair" that grew a third element in someone
else's refactor.

Labels (`[min: number, max: number]`) are purely for humans and tooling.
`[number, number]` and `[min: number, max: number]` are mutually assignable, so
the type gate accepts either — but every tooltip, every autocomplete and every
error message gets better when you write them. The same labelling syntax works
on function parameters in type positions, which is why
`(callback: (item: string, index: number) => void)` reads so much better than
`(callback: (a: string, b: number) => void)`.

Seeding from `values[0]` rather than `0` (or `Infinity`) is the runtime half.
The negatives case exists purely to catch the `let min = 0` version, which is
right for every test you would have written by hand and wrong for real data.

## ex3 — sort a copy, accept a promise

Two of the most reliable JavaScript interview questions live in this exercise.
The first: what does `[10, 9, 1].sort()` return? The answer is `[1, 10, 9]`,
because with no comparator `sort` converts elements to strings and compares
UTF-16 code units. The second: does `sort` return a new array? No — it sorts in
place and returns the *same* array, which is why `const sorted = values.sort()`
leaves both names pointing at one mutated object. (ES2023 added
`toSorted()`, which does return a copy; it is available on modern Node and is a
perfectly good answer, though the copy-then-sort idiom still reads clearer to
most reviewers.)

The type half is about variance in the direction people find least intuitive.
Widening a parameter from `number[]` to `readonly number[]` makes the function
*more* useful, because the set of arguments it accepts grows. Every mutable
array is also a valid readonly array; the reverse is not true. The rule of
thumb: a parameter type should be the weakest thing your body actually needs.
Ask "what do I do with this?" — if the answer is "read it", say `readonly`.

## ex4 — an array of pairs

Composing types is a syntax skill and it pays to say them out loud in the same
order you write them. `[string, number][]` is "array of (string-then-number
pair)"; `[string, number[]]` is "a pair whose second slot is a list of
numbers"; `[string | number][]` is "an array of one-element tuples", which is
almost never what anyone means.

The interesting inference detail is the accumulator. Write `const pairs = []`
and TypeScript gives you `any[]` (or `never[]` under some settings), then
watches you push anything at all into it. Write `const pairs: [string,
number][] = []` and the annotation flows *inward*: `pairs.push([name, score])`
now checks the literal against the tuple type, and `pairs.push([score, name])`
is caught immediately. This is contextual typing, and it is why annotating
empty containers is one of the few local annotations always worth writing.

If you reached for `map` instead of `push`, you may have hit the other side of
the same coin: `names.map((name, i) => [name, scores[i]])` infers
`(string | number)[][]`, not `[string, number][]`, because an array literal
widens to an array type unless something asks it to stay a tuple. Annotating
the callback's return type, or the whole `map` result, fixes it — as does `as
const`, which lesson 05 introduces.

## challenge — splitEvery

Chunking is a genuine interview warm-up, and the loop is not the point; the
edge cases are. Interviewers watch for three things: the short final chunk
(handled for free by `slice`'s clamping), the input that divides evenly (no
trailing `[]`), and the degenerate `size`. A `size` of `0` with `i += size` is
an infinite loop — the kind of bug that a type system by design cannot catch,
because `0` is as good a `number` as any other.

The `Number.isInteger` guard is the honest way to reject `2.5`. Notice how the
prompt had to *state* the rule: is `splitEvery(values, 2.5)` an error, an empty
result, or chunks of two? All three are defensible, which is exactly why the
prompt names one. When you write functions for other people, that decision is
yours to make and yours to document — and if you find yourself unable to
describe it in one sentence, the function is doing too much.

## review1 — firstAndLast

Nothing new here on purpose: a `readonly string[]` in, a labelled two-slot
tuple out. What the spaced-review scheduler is training is not the solution but
the *recall* — that a fixed-size, meaning-per-slot return wants a tuple, and
that a read-only parameter costs nothing and buys a guarantee.

The one wrinkle is `.at(-1)`, which returns `string | undefined` because `at`
cannot know your array is non-empty. Bracket indexing returns plain `string`
because `number[]` indexing is (deliberately) unsound without
`noUncheckedIndexedAccess`. Both are defensible; noticing that the two spellings
of "last element" have different types is the point, and lesson 04 is where
handling the `undefined` half stops being annoying.

## Further reading

- [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — arrays, tuples, inference and the rest of the daily vocabulary, in one page.
- [Handbook: Object Types — `readonly` and tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) — the reference for `readonly` properties, `ReadonlyArray`, and named tuple members.
- [`tsconfig` reference: `noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess) — what array indexing would look like if TypeScript were fully honest, and why teams turn it on late.
- [MDN: `Array.prototype.sort()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) — the in-place, string-comparing behaviour that ex3 is built around, plus `toSorted()`.
- [TypeScript Deep Dive: type inference](https://basarat.gitbook.io/typescript/type-system/type-inference) — a longer walk through widening, contextual typing and where inference gives up.
