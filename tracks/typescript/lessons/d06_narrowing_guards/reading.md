# Reading - typescript/d06_narrowing_guards

The debrief. Per problem: what the guard was really testing, the mistake that
gets past review, and one sentence on the model answer.

## Notes

**The skill this set drills is turning a runtime check into a compile-time
fact.** Control flow analysis already does this inside a function - a `typeof`
test refines the type for the lines that follow - but it stops dead at a
function boundary. `value is T` and `asserts value is T` are the two ways to
carry the conclusion across that boundary, and choosing between them is the
recurring question here.

**A predicate answers, an assertion insists.** `isPoint(value): value is Point`
returns a boolean and narrows inside the branch you write. `assertIsRecord(value):
asserts value is Record<string, unknown>` returns nothing, throws on failure, and
narrows the rest of the enclosing scope. Use a predicate when the caller has
something sensible to do with `false`; use an assertion when they do not.

**Both are promises the compiler does not check.** A predicate whose body
returns `true` unconditionally compiles fine and lies to every caller forever.
That is the price of the feature, and it is why a guard is one of the few places
where a unit test earns its keep even in a strongly typed codebase - which is
exactly what this drill set is.

**`typeof` has two famous holes and you will hit both.** `typeof null === "object"`
and `typeof [] === "object"`, so any "is this a plain object" check needs three
clauses: the `typeof`, an explicit `!== null`, and `!Array.isArray(value)`.
ex2, ex3, ex4 and ex7 all turn on that trio.

**And `unknown` is the honest type for data from outside.** It is `any` with the
safety on: you may hold it, pass it and store it, and you may not read a
property or call it until you have proved something. Every `JSON.parse`,
`process.env` lookup and request body in a serious codebase starts as `unknown`
and ends up narrowed by a function that looks like one of these eight.

## ex1 - is this text

What this was testing: the difference between `boolean` and `value is string` in
a return type. The runtime behaviour is identical; the type gate is the only
thing that can tell them apart, which is the point being made.

The classic mistake is `typeof value === "string" && value.length > 0`, which
accepts `"   "`. The prompt and the gate both call a whitespace-only string
empty, because that is what a form field or a CSV cell means by it.

The model answer is one expression: the `typeof` check first (so `.trim()` is
safe), then the emptiness test on the trimmed value.

## ex2 - what is this, exactly

What this was testing: knowing the shape of `typeof`'s answer set and where it
lies. Eight labels, and two of them - `"null"` and `"array"` - do not come from
`typeof` at all.

The classic mistake is checking `Array.isArray` after the `typeof === "object"`
branch has already returned `"object"`; order matters, and the two special cases
have to be tested before the general one.

The model answer returns `"null"` and `"array"` from explicit checks at the top
and then falls through to `typeof`, whose remaining answers happen to be exactly
the six labels that are left - which is also why the return type is a literal
union rather than `string`.

## ex3 - is this a point

What this was testing: a structural guard over `unknown`, and the property
access problem that comes with it - you cannot read `value.x` until you have
proved `value` is an object, and even then TypeScript does not know `x` exists.

The classic mistake is `typeof value === "object" && typeof value.x === "number"`,
which does not compile, followed by `value as Point` to make it compile - which
throws the check away entirely, since the cast is what you were trying to
justify.

The model answer casts once to a `{ x?: unknown; y?: unknown }` shape (or
indexes through `Record<string, unknown>`) after establishing the value is a
non-null object, then checks both members with `typeof`. One documented cast,
inside the guard, is the accepted answer.

## ex4 - assert, do not ask

What this was testing: the `asserts` return type, and the fact that its
narrowing applies to everything after the call rather than to a branch. The type
gate calls it and then checks the type on the very next line.

The classic mistake is writing the body as `if (ok) return true` - an assertion
function returns `void` and communicates by throwing. The second-classic is
forgetting `Array.isArray`, because an array is genuinely a `Record<string,
unknown>` structurally and almost never what "a plain object" means.

The model answer is one negated condition and one `throw`, which is also why
assertion functions read so well at the top of a request handler: three lines of
preamble and the rest of the function is typed.

## ex5 - three ways to spell a timestamp

What this was testing: `instanceof` alongside `typeof`, and the ordering that
makes them cooperate. `typeof new Date()` is `"object"`, so the `Date` branch has
to be an `instanceof`, and it is cheapest to take it first.

The classic mistake is `Number(value)` for the whole string branch: `Number("2026-03-01")`
is `NaN`, so every ISO date falls into the error path. Splitting the string case
into "digits" and "everything else" is the fix.

The model answer checks `Date` first, then `number`, then treats the remaining
string in two steps - and it is worth knowing that `instanceof` fails across
realms (an iframe, a worker, Node's `vm`), which is why library code often adds a
duck-typed fallback.

## ex6 - a guard that filters

What this was testing: that `Array.prototype.filter` has an overload taking a
type predicate, so `values.filter(isTag)` returns `Tag[]` with no cast. That
overload is the single most useful consequence of writing guards.

The classic mistake is `values.filter((v) => isTag(v))`, which wraps the
predicate in an arrow whose return type is plain `boolean` - and the narrowing
is lost. Pass the guard itself.

The model answer is one line in `collectTags`, which is the whole argument for
putting the work in the guard: the interesting code is written once and reused
by `filter`, `find`, `some` and every `if` in the codebase.

## ex7 - read a config nobody typed

What this was testing: an ordered validation walk over `unknown`, where each
check both rejects bad input and narrows the value for the next one. This is
what every `zod`-style library is doing under the hood.

The classic mistake is checking the fields in a different order than the prompt
states, which passes four assertions and fails one - the gate deliberately hands
`{}` to prove `host` is checked first. The second-classic is spreading `raw`
into the result, which copies members the config never declared.

The model answer narrows to a `Record<string, unknown>` once, then validates
each field with a `typeof` plus a domain rule (non-blank, positive integer), and
builds a fresh object from the three values it proved - so the returned `Config`
contains only what it promises.

## ex8 - flatten a recursive union

What this was testing: a type alias that refers to itself through an array, and
a walk with three cases where two are leaves. `type TextNode = string | number |
readonly TextNode[]` is legal because the recursion goes through an array type.

The classic mistake is joining with `" "` unconditionally, which produces double
spaces for empty children - `["", "a"]` becoming `" a"`. Filter the empty pieces
out before joining, not after.

The model answer returns early for the two leaf cases and, for the array case,
collects the non-empty renderings of the children and joins them once - so
`[[[["deep"]]]]` costs four frames and no string concatenation until the end.

## Further reading

- [Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) - `typeof`, `instanceof`, `in`, truthiness and control flow analysis in one page.
- [Handbook: Using type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) - the `value is T` return type and the `filter` overload that makes ex6 one line.
- [Handbook: Assertion functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions) - `asserts value is T`, and the annotation rule that makes it work only for declared names.
- [MDN: typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) - the complete answer table, including the two holes ex2 exists for.
- [MDN: Date.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) - what is specified (ISO 8601) and what is implementation-defined.
