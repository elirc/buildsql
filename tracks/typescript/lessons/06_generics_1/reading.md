# Reading - typescript/06_generics_1

What a type parameter actually is, how inference decides what to put in it, and
why `any` is not a shortcut to the same place.

## Notes

**A generic function is a family of functions.** `first<T>` is not one
function with a fuzzy type; it is a template the compiler instantiates at every
call site, once per type argument. At runtime there is exactly one function —
type parameters are erased like everything else — but during checking,
`first(["a"])` and `first([1])` are checked as if you had written two separate
functions with `string` and `number` substituted in. That mental model
explains almost every generic error message you will ever read: the compiler is
telling you what it substituted and where the substitution stopped working.

**Inference, in one paragraph.** TypeScript collects *candidates* for each type
parameter from the arguments you passed, then picks one. Multiple candidates in
the same position are widened to a common supertype where possible
(`first([1, "a"])` gives `T = string | number`); candidates that conflict in an
invariant position produce an error. Contextual typing runs the other way: once
`T` is fixed by the first argument, the callback's parameters are typed for you,
which is why `mapArray([1, 2], (n) => n.toFixed(1))` needs no annotation on
`n`. When inference has nothing to work from — an empty array, a callback with
no arguments — the parameter falls back to `unknown`, and that is your cue to
pass the type argument explicitly.

**`any` vs `unknown` vs a type parameter.** This trio is the most-asked
TypeScript interview question, so have a crisp answer. `any` disables checking:
every operation on an `any` compiles, and the infection spreads to anything
derived from it. `unknown` is its safe twin — you may hold one, but you must
narrow before you use it — which makes it the right type for genuinely unknown
input like `JSON.parse` output. A type parameter is different in kind from
both: it does not describe a value at all, it *carries* the caller's type
through the function so it can be handed back. Use `unknown` at the boundary,
generics in the plumbing, `any` when migrating legacy code and you have a
deadline.

**Where generics stop being worth it.** A type parameter that appears exactly
once in a signature is doing nothing. `function log<T>(value: T): void` is
`function log(value: unknown): void` with extra ceremony — the classic
"needless generic" review comment. The useful test is: does this parameter
connect two places? Input to output (`first`), one argument to another
(`lastOr`), a class field to a method (`Box`). If not, delete the angle
brackets.

**Generic defaults, constraints, and `keyof` are next.** This lesson leaves out
three things you will want almost immediately: `<T extends { id: string }>` to
require structure, `<T = string>` to supply a default, and `K extends keyof T`
to talk about property names. Lesson 07 is those three.

## ex1 — the head of any list

The exercise is a two-line function whose entire content is the signature.
`unknown[]` in and `unknown` out is a *correct* description of what the code
does and a useless one for callers: `first(["ada"]).toUpperCase()` is an error,
and the only ways out are a cast or a narrowing check, both of which throw away
information the caller already had. `T` gives it back.

`T | undefined` in the return type is the honest part. An empty array has no
first element, and pretending otherwise is how `cannot read property 'name' of
undefined` gets into production. Note the alternative designs and what each
costs: throw (callers must catch), take a fallback (review1 does this — the
return type loses the `undefined` entirely), or return `T` and lie. The third
is what `noUncheckedIndexedAccess` would prevent, and it is a flag worth
knowing about even though this course leaves it off.

## ex2 — two type parameters

`mapArray` is `Array.prototype.map` rewritten, and reading its real signature in
`lib.es5.d.ts` is worth a minute of your life:
`map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[]`.
Same shape, same reason: `T` comes from the array, `U` comes from the callback.

The subtle thing here is *contextual typing*. When you pass an inline arrow,
TypeScript types its parameters from the position it is being passed into — it
does not infer them from the body. That is why `(n) => n.toFixed(1)` works with
no annotation and why the `@ts-expect-error` probe (`n.toUpperCase()`) is a
compile error rather than a runtime one. Move the same arrow into a `const`
first and the magic disappears: standalone arrows have no context, so their
parameters become implicit `any` and `noImplicitAny` complains.

If you delegated to `items.map(...)` — good instinct, and note that
`readonly T[]` has `map` but not `push`, so the readonly parameter cost you
nothing.

## ex3 — a generic interface with a generic method

The two type parameters are the lesson. `T` is fixed when the type is written
down: a `Box<string>` holds a string forever. `U` is fixed when `map` is
*called*: every call gets its own. Writing `map(transform: (value: T) => T):
Box<T>` instead would compile and would make `box("hi").map(s => s.length)` an
error — the box could never change what it holds, which is exactly the
limitation `U` removes.

This shape — a container plus a `map` that returns a new container of a
different type — is a *functor*, and you have used it a hundred times without
the vocabulary: `Array.map`, `Promise.then`, `Option`/`Maybe` in other
languages, RxJS operators. Recognising it means you can predict what the API
looks like before you read the docs.

The "map returns a new box" assertion is the immutability habit from lesson 03
in a generic setting. A `map` that mutated the box in place would have to
return `Box<T>` and could not change the type at all — the type signature and
the immutability are the same decision viewed from two sides.

## ex4 — zip, one last time

Comparing this file with `01_primitives_and_inference/ex4` is the point of the
exercise. The bodies are identical; only the signature moved from concrete to
parameterised. That is what "generic" means in practice — not a new algorithm,
a *reusable* one.

`[A, B][]` also demonstrates that type parameters compose with everything else
in the type system. They go inside tuples, arrays, unions, object types, other
generics. There is no separate "generic type" world; a type parameter is just a
type you have not been told yet.

## challenge — uniqueBy

One type parameter, because the elements pass through untouched. The key
function is where a second one *could* have gone — `key: (item: T) => K` with
`K extends string | number | symbol` — and that version is what lesson 07's
constraints let you write. Restricting the key to `string` here keeps the
`Set<string>` honest.

The "first wins" rule matters more than it looks. Deduplication that keeps the
*last* occurrence needs either a reverse pass or a `Map` that overwrites, and
the two rules produce different data — a real bug when someone assumes the
wrong one. When you write this function for real, name it in a way that says
which: `uniqueByFirst`, or document it in one line.

Performance footnote, since interviewers ask: `Set.has`/`Set.add` are
effectively O(1), so this is one pass and O(n). The tempting
`result.some(existing => key(existing) === k)` version is O(n²) and calls the
key function far more often than necessary — fine for ten items, not fine for
ten thousand.

## review1 — lastOr

The one new idea versus ex1 is that `T` appears in *two parameters*, which ties
them together: the fallback must be the same type as the elements.
`lastOr([1, 2], "none")` is an error, and the error message shows exactly what
was inferred and what did not fit. That coupling is what a type parameter is
for; a version taking `fallback: unknown` would compile and would hand back a
useless type.

It also removes `| undefined` from the return type entirely, which is the
cleanest way to make a "might be missing" function pleasant: push the decision
to the caller, once, at the call site, instead of forcing every caller to
narrow afterwards. Both designs are right in different places, and having
written both is how you develop an opinion about which.

## Further reading

- [Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — type parameters, generic interfaces and classes, and the "generic constraints" section that lesson 07 picks up.
- [Handbook: Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html) — best common type, contextual typing, and how candidates are chosen.
- [Handbook: `unknown` and `any`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any) — the official framing of the two escape hatches, and why one is much worse than the other.
- [TypeScript Deep Dive: generics](https://basarat.gitbook.io/typescript/type-system/generics) — the same material with more worked motivation, including the "needless generic" smell.
- [`lib.es5.d.ts` — `Array<T>`](https://github.com/microsoft/TypeScript/blob/main/src/lib/es5.d.ts) — read the real signatures of `map`, `filter` and `reduce`; they are the best generic examples in existence and they ship with your compiler.
