# Reading - typescript/08_utility_types

The standard library of types, what each one is made of, and the places where
the type-level story and the runtime story stop agreeing.

## Notes

**Utility types are ordinary type code.** Open `lib.es5.d.ts` in your editor
(hover `Partial` and press F12) and you will find five-line definitions built
from `keyof`, `T[K]`, mapped types and conditional types. Nothing in there is
compiler magic except `Awaited`'s recursion and a couple of intrinsics
(`Uppercase`, `Capitalize` and friends are genuinely implemented in the
compiler). Knowing this changes how you read unfamiliar library types: hover,
read, recognise the parts.

**The catalogue worth memorising.** `Partial<T>` (all optional), `Required<T>`
(all required), `Readonly<T>` (all readonly), `Pick<T, K>` (keep these keys),
`Omit<T, K>` (drop these keys), `Record<K, V>` (build from a key union),
`Exclude<U, X>` / `Extract<U, X>` (filter a union), `NonNullable<T>` (drop
`null` and `undefined`), `Parameters<F>`, `ReturnType<F>`, `Awaited<T>`,
`InstanceType<C>`. That list covers virtually every derivation you will need in
application code.

**`Omit` is the loose one.** `Pick<T, K>` constrains `K extends keyof T`, so a
typo is a compile error. `Omit<T, K>` deliberately does *not* — its `K` is
`keyof any` — so `Omit<User, "passwrodHash">` silently omits nothing. That is a
real source of bugs and a good interview detail; teams that care define a strict
version (`type StrictOmit<T, K extends keyof T> = Omit<T, K>`) and use it
everywhere.

**Mapped types are where `?` and `readonly` become editable.** `+?`/`-?` and
`+readonly`/`-readonly` add and remove modifiers, which is how `Required<T>` and
`Mutable<T>` are written. Note the subtlety of `-?`: it removes the optionality
*and* strips `undefined` from the member's type, which is usually what you want
and occasionally surprising.

**`Partial<T>` and `undefined` are an awkward pair.** `Partial<Options>` allows
both "no `label` key" and "`label: undefined`", because an optional member's
type includes `undefined`. That is why `{ ...base, ...patch }` fails ex1's third
case: spreading copies the explicit `undefined` over a perfectly good value.
`exactOptionalPropertyTypes` is the compiler flag that separates the two (with
it on, `{ label: undefined }` is no longer a valid `Partial<Options>`), and it
is worth knowing about even though almost nobody turns it on.

**Runtime and type-level `Omit` are different operations.** At the type level,
removing a key is free. At runtime you have to actually not have the property —
`delete`, rest destructuring, or building a new object — and the compiler cannot
follow any of those precisely. `delete obj.prop` only compiles for optional
properties; rest destructuring (`const { secret, ...rest } = user`) is the one
form TypeScript types exactly, which is why it is the idiomatic answer.

## ex1 — Partial

The signature change is one word, and the interesting content is the third
test. `{ ...base, ...patch }` is the obvious implementation, it is what most
codebases contain, and it treats `{ label: undefined }` as an instruction to
erase `label`. Whether that is a bug depends on your API — but with a
`Partial<T>` patch it almost always is, because "the caller did not mention
this" and "the caller explicitly said undefined" arrive looking identical.

The cast on the way in (`(merged as Record<string, unknown>)[key] = value`) is
worth staring at. `Object.entries` returns `[string, any][]`, so the key you
have is a `string` and TypeScript will not accept a `string` as a key of `T` —
correctly, since a `T` could have exactly three known members. Every honest
implementation of this function contains a cast somewhere; the discipline is to
put it at the narrowest point and comment why.

## ex2 — Pick and Omit

`Omit<User, "passwordHash">` and `Pick<User, "id" | "email">` are the two
directions, and choosing between them is a design statement. Use `Omit` when the
type is "everything, minus the dangerous bit" — new members should be included
by default, and a new secret field will *not* be excluded until someone updates
the type. Use `Pick` when the type is "these specific fields" — a new member
will not leak, because it was not named. For anything security-relevant, `Pick`
is the safer default precisely because it fails closed.

The runtime half matters as much. The gate checks `"passwordHash" in publicUser`
rather than `publicUser.passwordHash === undefined`, because a serialiser will
happily ship `"passwordHash": undefined` as a key — or, worse, `JSON.stringify`
drops it while a database driver writes it. "Absent" and "present but undefined"
are different, and the type `Omit<User, "passwordHash">` promises the first.

Rest destructuring is the tool TypeScript types precisely here: `const {
passwordHash, ...rest } = user` gives `rest` the exact `Omit` type with no cast.
Some lint configs will complain about the unused `passwordHash` binding; the
conventional answer is a rule exception for rest siblings, not a `delete`.

## ex3 — write two of them yourself

Writing `{ [K in keyof T]?: T[K] }` from memory is the point. Once you can, the
whole family becomes obvious, and the next time you need "every member optional
except `id`" you will write it in one line instead of by hand.

The accumulator cast in `pickKeys` deserves the paragraph the hint promised.
The honest version — building the object incrementally — cannot typecheck,
because after assigning one of three keys the object is not yet a
`MyPick<T, K>`, and TypeScript has no notion of "partially built". Your options
are: `{} as MyPick<T, K>` (a single, local, deliberate lie); building through
`Record<string, unknown>` and casting on return (the same lie, moved); or
`Object.fromEntries`, which returns `{ [k: string]: T }` and needs a cast
anyway. The standard library's own implementations use casts internally for
exactly this reason. Casts are not forbidden; unexplained casts are.

## ex4 — types derived from functions

`Awaited<ReturnType<Loader>>` is the idiom for "what does this async function
actually produce", and it composes: `Awaited` unwraps nested promises and leaves
non-promises alone, so it is safe to apply even when you are not sure. Before
it existed, everyone had their own `UnwrapPromise<T>` with a conditional type,
and half of them handled `PromiseLike` wrong.

The `F extends (...args: any[]) => any` constraint is the one place the
community agrees `any` is correct, and being able to explain why is a good
interview moment. The constraint's job is to say "some function"; using
`unknown[]` for the parameters breaks because function parameters are compared
*contravariantly* — a function taking `(a: number)` is not assignable to one
taking `(a: unknown)` — so real functions stop matching the constraint.
`never[]` works for the constraint but produces useless inference elsewhere.
`any` in a constraint position touches nothing outside it, because
`Parameters<F>` and `ReturnType<F>` recover the real types immediately.

The runtime behaviour — cache the first result, ignore later arguments — is
`once`, not `memoize`. A memoiser keys on the arguments and needs a `Map`, a
serialisation strategy for keys, and a story about when entries expire. Naming
the two apart in your own code saves a code review.

## challenge — MyOmit and the runtime half

`{ [P in Exclude<keyof T, K>]: T[P] }` is the definition, and `Exclude` is your
first look at a conditional type: `T extends U ? never : T`, distributed over
each member of the union. Lesson 09 explains why that distributes at all; for
now, note that "filter a union" and "subtract a union" are the same operation.

The runtime half is the real challenge, and its lesson is that `delete` is a
badly-typed operation. TypeScript only allows it on optional properties because
deleting a required one leaves the object contradicting its own type — a rule
that is *correct* and that makes the honest implementation impossible without a
cast. Two alternatives worth knowing: building the result by copying the
surviving keys (no `delete`, and no touching of inherited properties), and
`Object.fromEntries(Object.entries(source).filter(...))`, which is elegant and
loses all type information. Some performance-focused codebases ban `delete`
entirely because it can deoptimise an object's hidden class in V8 — the copy
version sidesteps that too.

## review1 — Record

`Record<Verdict, number>` versus `{ [key: string]: number }` is the same choice
as lesson 03's index signature, now with the closed-key-set option available.
The difference shows up immediately: with `Record`, `{ pass: 0, fail: 0 }` is a
compile error naming `skip`, so a new verdict added to the union produces
errors in every tally that forgot it. With the index signature, it produces
`undefined` at runtime and `NaN` after one `+= 1`.

`Record<string, T>` is still useful — it is the honest type for a genuinely open
lookup — but reach for the closed version whenever the keys are known. And
remember what `Record<string, T>` does *not* do: it does not make lookups safe.
`board["typo"]` is a `number` as far as the compiler is concerned, and
`undefined` at runtime, exactly as in lesson 03.

## Further reading

- [Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) — the full catalogue with examples, including the ones this lesson skipped.
- [Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) — the `[K in keyof T]` loop, modifiers, and key remapping (which lesson 09 uses).
- [`tsconfig` reference: `exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes) — the flag that separates "absent" from "present and undefined".
- [MDN: destructuring with rest properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring#rest_property) — the runtime `Omit` that TypeScript types exactly.
- [TypeScript source: `lib.es5.d.ts` utility types](https://github.com/microsoft/TypeScript/blob/main/src/lib/es5.d.ts) — read `Partial`, `Pick`, `Omit` and `Exclude` in their original form; they are shorter than you expect.
