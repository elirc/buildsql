# Reading - typescript/03_objects_interfaces

Structural typing, the `interface`/`type` question you will be asked in an
interview, and the four object features that carry most real code.

## Notes

**Structural typing, properly.** TypeScript compares types by their members,
not their names. A function asking for `{ name: string }` accepts any value
that has a `name: string`, whoever declared it, whatever it is called, however
many extra members it carries. This is why TypeScript integrates so painlessly
with plain JavaScript objects and JSON, and why "duck typing, but checked" is a
fair one-line summary. The cost is that a type alias gives you no protection
against mixing up two things that happen to share a shape: `type UserId =
string` and `type OrderId = string` are the same type, full stop. Teams that
need the distinction reach for *branded types* — `type UserId = string & {
readonly __brand: unique symbol }` — which fake nominal typing by adding a
member no one can produce by accident.

**Excess property checking is a special case, and knowing it is a rite of
passage.** Structural typing says extra properties are fine, so
`const x = { a: 1, b: 2 }` is assignable to `{ a: number }`. But a *fresh
object literal* assigned directly to a typed target gets an extra check that
rejects unknown members, because a literal with a member the target has never
heard of is almost always a typo or a misunderstanding. Assign the literal to a
variable first and the check disappears — the literal is no longer "fresh".
Interviewers love this one because it looks like an inconsistency and is
actually a deliberate usability trade-off.

**`interface` vs `type`, the answer that gets you hired.** For describing an
object shape they are interchangeable, and either is fine. The real
differences: `interface` supports *declaration merging* (declare the same
interface twice and the members combine — that is how you augment `Window` or a
library's types), and it produces slightly friendlier error messages; `type`
can name things interfaces cannot — unions, intersections, tuples, primitives,
mapped and conditional types. `interface X extends Y` and `type X = Y & {...}`
mostly agree, but intersections silently produce impossible members where
`extends` reports a conflict. A good short answer: "interfaces for object
shapes that might be extended or merged, type aliases for everything else, and
never mix the two styles inside one module without a reason."

**`readonly` is shallow, and it is erased.** `readonly title: string` stops
assignment through that type and nothing else — a second reference typed
without `readonly` can still write to it, `Object.assign` still works, and
nothing is frozen at runtime. For arrays, `readonly tags: readonly string[]` is
two separate promises: the property cannot be swapped out, and the array cannot
be mutated. Deep immutability needs a recursive mapped type, which lesson 09
builds from scratch.

**Index signatures describe maps, and they lie a little.** `{ [slug: string]:
number }` says every string key yields a `number`, so `tally.typo` typechecks
and is `undefined` at runtime. That gap is real, and it is why
`noUncheckedIndexedAccess` exists (it makes every index read `number |
undefined`) and why `Record<string, number>` — lesson 08 — has exactly the same
hole. When keys really are a known set, a literal union key type is far safer:
`Record<"draft" | "published", number>` forces you to handle both.

## ex1 — finish the interface, then use it

The three test objects were the specification. Two of them carry a `challenge`
member and one does not, which is what forces the `?`; and the `challenge:
false` case forces the *rendering* to be a truthiness check rather than a
presence check. Those are different questions — "does this property exist" and
"is this property true" — and conflating them is a genuine bug class, most
famously with `hasOwnProperty` versus `if (obj.prop)` on a value that is
legitimately `0`, `""` or `false`.

Notice also what you did *not* have to do: the gate passes object literals
directly, and they satisfy `Lesson` without a single `as` or annotation. That is
structural typing paying for itself. Try deleting the `?` from `challenge` and
reading the resulting error — TypeScript points at the *literal*, tells you
which member is missing, and names the type it was checking against. Error
messages of that quality are the whole reason to describe your shapes.

## ex2 — a draft nobody can vandalise

`{ ...draft, title }` is the copy-on-write idiom, and it is everywhere in modern
JavaScript: Redux reducers, React state updates, immutable domain objects. The
ordering rule — later properties win — is worth burning in, because
`{ title, ...draft }` compiles perfectly and silently does nothing.

The type gate's two probes correspond to the two levels of `readonly`. Marking
`tags: readonly string[]` rather than `tags: string[]` is the deeper of the two
and the one people forget; without it, `draft.tags.push("late")` mutates an
object your type promised nobody would touch. And the honest caveat: spread is
shallow, so the renamed draft *shares* the tags array with the original. With
`readonly string[]` that sharing is safe, because neither side can mutate it
through the type — which is a neat demonstration of how an immutability
annotation can buy you a performance decision (no defensive copy) rather than
just a safety one.

## ex3 — keys you do not know in advance

The `(tally[slug] ?? 0) + 1` line is the whole exercise, and it is worth
knowing why `||` would also have worked here: the only falsy `number` is `0`,
and adding 1 to a fallback of `0` produces the same answer as adding 1 to `0`
itself. That coincidence is exactly what makes `||` such a durable source of
bugs — it works until the day a legitimate `0`, `""` or `false` is the answer
you needed to keep, and then it fails somewhere far from where it was written.

The type-level lesson is that an index signature is a *claim*. `tally["anything
at all"]` is a `number` according to the compiler and `undefined` according to
the runtime, and TypeScript accepts that gap for ergonomics. Whenever you write
one, ask whether the key set is genuinely open. If it is closed — statuses,
levels, track names — a union key type turns every missing case into a compile
error instead of an `undefined` at 3am.

## ex4 — optional in, required out

Two types for one concept is not duplication; it is the difference between what
callers may say and what your code may assume. Library authors write this pair
constantly (`Options` and `ResolvedOptions`, `Props` and `NormalizedProps`), and
lesson 08's `Partial<T>` and `Required<T>` will let you derive one from the
other in a single line instead of writing both by hand.

The `??` versus `||` distinction is the most frequently-cited "modern
JavaScript" interview question, and this exercise is its canonical shape.
`options.retries || 1` turns an explicit `0` into `1`; `options.retries ?? 1`
does not, because `??` only falls back on `null` and `undefined`. The same trap
with `verbose: false` is even nastier, because a boolean option that cannot be
turned off looks like a bug in something else entirely.

The hint's aside about `{ ...defaults, ...options }` is worth chasing. That
spelling is shorter and it is what most libraries do — but if a caller passes
`{ label: undefined }` explicitly, the spread copies that `undefined` over your
default, while the `??` version does not. Both behaviours are defensible; only
one of them is what you probably meant.

## challenge — summarise a curriculum

Nesting interfaces is unremarkable, which is the point — the type system scales
by composition, and `readonly Lesson[]` inside `Part` reads exactly like
`readonly string[]` did in lesson 01. The two counts come from two different
operations on the same array, and the empty part checks that both of them are
written to survive it: `[].length` is `0`, and `[].reduce((a, b) => a + b)`
*throws* unless you pass an initial value. That initial value is the single
most common `reduce` bug, and it is the reason many teams prefer an explicit
loop.

The arrow-returning-an-object trap deserves its own line, because everyone hits
it once: `(part) => { title: part.title }` is a function with a *labelled
statement*, not an object literal, and it returns `undefined`. The parentheses
in `(part) => ({ ... })` are not style, they are syntax.

## review1 — greetLearner

The nickname fallback is `??` for the third time in this lesson, deliberately.
Spaced review is not about remembering that this exercise used `??`; it is
about the reflex that "absent" and "falsy" are different questions, so that in
two months, when a real options object with a `0` in it crosses your desk, the
right operator is already in your fingers.

The zero-streak branch is the same shape as lesson 00's pluralisation: a
rendering decision the type system has no opinion about. Types will tell you
that `streak` is a `number`; they will never tell you that `0` deserves
different words. That division of labour — types for shape, tests for
behaviour — is the whole reason this course grades both.

## Further reading

- [Handbook: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) — optional and readonly members, index signatures, extending interfaces, and the excess property check.
- [Handbook: Everyday Types — `interface` vs type alias](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) — the official side-by-side, including declaration merging.
- [Handbook: Type Compatibility (structural typing)](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) — how assignability is actually decided, with the surprising cases.
- [MDN: spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) — object and array spread, and exactly how shallow it is.
- [MDN: nullish coalescing (`??`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — the operator ex4 is built on, with the `||` comparison spelled out.
