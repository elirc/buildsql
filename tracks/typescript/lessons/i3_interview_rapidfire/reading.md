# Reading - typescript/i3_interview_rapidfire

Five ⭐⭐⭐ concepts, one more time, with the traps that make each of them an
interview question rather than a triviality.

## Notes

**Why these five.** `unknown` at the boundary, exhaustiveness with `never`, a
constrained generic with `keyof`, a utility type written from scratch, and
`satisfies` on a config object. Across mid-level full-stack screens these are
the TypeScript topics that come up most, and each one has a short, sayable
answer that this track has now given you three times.

**Retrieval, not review.** Rereading a lesson feels productive and does very
little; being asked a question cold and having to produce the answer is what
moves it into long-term memory. That is why these exercises are freshly phrased
rather than repeats, and why the review ladder — 3 days, 7, 21, 60 — matters more
than any single sitting. `dojo review run` is the command; keeping the streak is
the work.

**Speak the shape before you type it.** Every round here has a signature that
gives away the solution: `(value: unknown) => number | null`,
`<T, K extends keyof T>(items: readonly T[], key: K) => T[]`,
`T extends null | undefined ? never : T`. In an interview, saying the signature
out loud is both the fastest way to the answer and the clearest demonstration
that you think in types.

**When you finish the track.** The honest last step is to be interviewed — by a
friend, a colleague, or an interviewer you do not mind losing. Nothing in a
course reproduces the specific pressure of explaining variance to a stranger
while your screen is shared.

## ex1 — `unknown` in, narrowed out

Three traps in one small function. `typeof NaN === "number"` is true, so a
`typeof` check alone lets `NaN` through — `Number.isFinite` is the guard, and it
is the *static* method deliberately, because the global `isFinite` coerces its
argument (`isFinite("42")` is `true`, which defeats the point). `Number("")` is
`0`, so an empty string silently becomes a valid number unless you check for it.
And `Number("   ")` is also `0`, which is why the check is on the *trimmed*
string.

The design question worth raising in an interview: which string formats count?
`Number()` accepts `"1e3"`, `"0x1f"`, `"Infinity"` and leading/trailing
whitespace; `parseFloat` accepts a numeric prefix and ignores the rest
(`parseFloat("42abc")` is `42`); `parseInt` needs a radix and truncates. Naming
that difference unprompted is the kind of detail that gets remembered.

*Weak here → redo `10_guards_assertions`.*

## ex2 — close the union

The shipped code is a realistic bug: two branches, a catch-all `default`, and a
union that grew. Nothing failed to compile, and the wrong answer (`"?"`) is
plausible enough to survive review. That is precisely why `assertNever` is worth
the five lines — it converts "somewhere in this codebase a string is now wrong"
into a compile error at the exact site.

The one-sentence explanation to have ready: "in an exhaustive switch the default
branch narrows the value to `never`, and nothing is assignable to `never`, so the
call only compiles when every case is handled." Follow it with the reason it
also throws: types are erased, so a bad value really can arrive at runtime from
`JSON.parse` or a JavaScript caller.

The final nudge in the hint — returning `"*" | "**" | "***" | "****"` instead of
`string` — is the habit this track keeps pushing: give callers the narrowest
useful type. It costs nothing and lets them `switch` exhaustively in turn.

*Weak here → redo `04_unions_narrowing` and `i1_interview_concepts` ex2.*

## ex3 — constrain the key

`<T, K extends keyof T>` for the third time, because it is the single most
common generic signature in real TypeScript. The stub's `(items: readonly any[],
key: string)` is what the same function looks like when nobody bothered: it
compiles, it runs, and it accepts `sortByKey(learners, "nickanme")` without a
murmur.

Two runtime details the gate checks. The copy — `sort` mutates, and a `readonly`
parameter makes the compiler enforce that you copied. And returning `0` for
equal values rather than a guess, which matters because `Array.prototype.sort`
has been required to be *stable* since ES2019: equal elements keep their input
order, so a stable sort by one key after another gives you a predictable
multi-key ordering.

The follow-up to expect: "what if the property is a `Date`, or a mixed
`string | number`?" `<` works on dates by coercion and on mixed types by
lexicographic accident, which is why a production version takes an optional
comparator. Saying that is better than pretending `<` is universal.

*Weak here → redo `07_generics_2`.*

## ex4 — write the utility type

`MyNonNullable<T> = T extends null | undefined ? never : T` is four things at
once: a conditional type, a naked type parameter (so it distributes over the
union), `never` as the "drop this" signal, and the fact that `never` disappears
from a union. Being able to unpack that sentence is a strong senior answer to
"how does `Exclude` work?".

`MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never` is the
`infer` half. `never[]` in the parameter position is the trick that makes the
pattern match every function regardless of its parameters — parameters are
checked contravariantly, and `never` is assignable to everything, so it fits
them all. The standard library uses `any[]` for the same reason; both work, and
knowing *why* one of them is needed is the point.

The runtime half is the type-guard predicate:
`items.filter((item): item is MyNonNullable<T> => item !== null && item !==
undefined)`. Without the predicate, `filter` returns `T[]` and the `null` is
still in the type — a genuinely common frustration, and the reason
`array.filter(Boolean)` is such a poor idea in TypeScript (it also drops `0`,
`""` and `false`, which the gate checks for).

*Weak here → redo `08_utility_types` and `09_mapped_conditional`.*

## review1 — `satisfies`, one more time

The annotation `: Record<string, { method: Method; path: string }>` does three
damaging things at once: it widens each `path` to `string`, widens each `method`
to the `Method` union, and — worst — gives the object an index signature, so
`keyof typeof ROUTES` becomes `string` and `describeRoute("lisstLessons")`
typechecks. That last consequence is the one people miss, and it is the strongest
argument for `satisfies` in a single example.

`as const satisfies T` is the combination worth memorising for config: `as const`
keeps every literal and makes it read-only, `satisfies` still validates the whole
shape, and the object's own inferred type — with exactly its real keys — survives.
Route tables, feature flags, design tokens, and command registries all want it.

The open question in the hint is a real design point: `Record<string, ...>` as
the constraint checks the *values* but not the key set. If you want the key set
constrained too, name it — `Record<RouteName, RouteDefinition>` — and now a
missing route is a compile error as well.

*Weak here → redo `05_literals_enums` and `10_guards_assertions` ex4.*

## Further reading

- [Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — `unknown`, type guards and the exhaustiveness recipe, all in one page.
- [Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) — `NonNullable`, `ReturnType` and the rest, with their definitions.
- [TypeScript 4.9: the `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — the motivating example, one page.
- [MDN: `Array.prototype.sort` — stability](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sort_stability) — why returning `0` for equal elements is the right move.
- [MDN: `Number.isFinite` vs the global `isFinite`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite) — the coercion difference behind round 1.
