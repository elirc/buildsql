# Reading - typescript/d01_annotations_inference

The debrief for the annotation drills: what each problem was really asking,
the mistake that costs the point, and the one sentence of reasoning behind the
model answer.

## Notes

**The skill this set drills is deciding where a type has to be written down.**
TypeScript infers a great deal - the type of a `const`, the return type of a
function whose body it can see, the parameter of a callback in a position it
already knows. It cannot infer what you never told it: the parameters of an
exported function, the shape you *intend* to return when several shapes would
compile, or the difference between an array and a tuple. Those are the three
places these eight problems keep poking at.

**Every wrong annotation in this set is a plausible one.** `string[]` really
does describe `["roof", "3"]`; `(string | number | boolean)[]` really does
describe a row of mixed cells; `number[]` really does describe the array you
just built. They are all true and all useless, because they throw away the
length, the position, or the promise not to mutate. The habit worth building
is to ask "what does this type *forbid*?" - a type that forbids nothing is
documentation, not a check.

**Tuples are the recurring shape here** - `[site, index]`, `[station, celsius,
ok]`, `[value, count]` - because a fixed-length, position-typed result is
exactly the thing an array type cannot express. The labels (`[site: string,
index: number]`) are erased at runtime and exist only so your editor and your
reader know which slot is which. Take them; they cost nothing.

**And `readonly` is an annotation about permission, not about storage.**
`readonly number[]` on a parameter is a promise you will not sort, push or
splice the caller's data; on a return type it is the same promise back to
them. Nothing is frozen at runtime - `Object.freeze` is a different tool - so
the value of `readonly` is entirely in the errors it produces at compile time.

## ex1 - format a reading

What this was testing: whether you annotate both parameters and the return
type without being reminded, and whether you know that `toFixed` produces a
*string* with a fixed number of decimals while `Math.round` produces a number
that silently drops trailing zeroes.

The classic mistake is `Math.round(celsius * 10) / 10`, which turns `21` into
`21` rather than `"21.0"` and makes the third assertion fail for a reason that
looks like a rounding bug and is really a formatting one.

The model answer is one template literal: the string work belongs to
`toFixed(1)`, and the function's only job is to glue two pieces together.

## ex2 - a clock label

What this was testing: input sanitising before arithmetic. Three inputs are
hostile - a negative, a fraction, and anything at or above an hour - and each
one breaks a different naive implementation.

The classic mistake is capping minutes with `% 60`, which is what `Date` and
most clock helpers do, and which turns 3600 seconds into `00:00`. The prompt
says minutes are not capped, and reading the prompt is part of the drill.

The model answer clamps and floors once at the top (`Math.max(0,
Math.floor(seconds))`) so that everything after it is ordinary integer
arithmetic, and pads with `String(n).padStart(2, "0")` rather than with a
hand-rolled `n < 10 ? "0" + n : n`.

## ex3 - split a station id

What this was testing: the difference between an array type and a tuple type.
`string[]` compiles happily for `["roof", 3]`? No - and that is the point: the
moment the second slot is a number, `string[]` stops being true at all, and the
compiler will not let you return it.

The classic mistake is `id.split("-")`, which is wrong twice: it splits at the
*first* dash, so `"north-wall-12"` comes back in three pieces, and it produces
strings, so the index is `"12"` rather than `12`.

The model answer finds `lastIndexOf("-")`, validates that everything after it
is digits, and falls back to `[id, 0]` in both failure cases - because a site
name is allowed to contain a dash and an index is not allowed to contain a
letter.

## ex4 - the highest readings, without touching the input

What this was testing: `readonly` in both directions, plus the oldest trap in
JavaScript arrays. `Array.prototype.sort` mutates the array it is called on and
returns that same array, so sorting a parameter is a side effect on data you
were only lent.

The classic mistake is `values.sort(...)` - which the `readonly number[]`
parameter type catches for you at compile time, which is exactly why the
annotation is worth writing. The second-classic is forgetting the numeric
comparator, because the default sort compares stringified elements and puts
`10` before `9`.

The model answer copies with a spread, sorts the copy descending, and slices -
`slice` already clamps an over-long count, so the only branch worth writing is
the zero-or-negative one.

## ex5 - one object, three numbers

What this was testing: writing an object type inline in a signature, and
noticing that a stub whose body only throws infers `never` - which satisfies
every annotation and therefore proves nothing until you supply one.

The classic mistake is seeding `min` and `max` from `0` instead of from
`values[0]`, which is invisible until a list of negatives arrives and reports a
spread that includes a value that was never in the data.

The model answer takes one pass with three accumulators and returns early for
the empty list, because `0 / 0` is `NaN`, `NaN` is not `0`, and no amount of
later arithmetic recovers from it.

## ex6 - parse one CSV row

What this was testing: a tuple whose slots have three *different* types, which
is the case an array type provably cannot describe. `(string | number |
boolean)[]` allows a row of nine booleans; the tuple allows exactly one shape.

The classic mistake is trusting `Number()`. `Number("")` is `0`, `Number("warm")`
is `NaN`, and `NaN` flows silently through every later average and comparison -
so the guard belongs at the parse boundary, not downstream.

The model answer trims every field once, then treats each slot independently:
text, a guarded number, and a strict equality against `"true"` - because
`Boolean("false")` is `true` and that is a bug generator.

## ex7 - a moving average

What this was testing: guard conditions stated as a set (not an integer, not
positive, longer than the data) and index arithmetic over a sliding window.
This is the first problem in the set where the interesting work is in the loop
rather than in the signature.

The classic mistake is emitting a partial window at the start - `[1, 1.5, 2.5,
3.5]` for `([1, 2, 3, 4], 2)` - which happens when the push is unconditional
instead of waiting for `i >= window - 1`.

The model answer keeps a running sum, adding the entering element and
subtracting the leaving one, so the whole thing is linear rather than
quadratic; the `slice`-and-`reduce` version is correct too, and saying you know
the difference is the part an interviewer marks.

## ex8 - run-length pairs

What this was testing: an array whose element type is itself a tuple, and the
distinction between a *run* and a *tally*. `[1, 2, 1]` has three runs and two
distinct values, and confusing the two is the single most common wrong answer.

The classic mistake is reading the previous input element instead of the
previous *pair*: it works until you need the count, at which point you are
carrying two pieces of state that can disagree.

The model answer keeps only the accumulator and looks at its last pair, which
makes the empty case free - there is no last pair, so the first value always
starts a run.

## Further reading

- [Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) - annotations on parameters and returns, arrays, and where inference already has the answer.
- [Handbook: Object Types - tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) - fixed-length arrays, labelled elements, and `readonly` tuples.
- [Handbook: `readonly` and const assertions](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) - what `readonly` forbids, and what it deliberately does not.
- [MDN: `Number.prototype.toFixed`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed) - rounding behaviour, and why it returns a string.
- [MDN: `Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) - in-place mutation and the default string comparison that ex4 punishes.
