# Reading - typescript/07_generics_2

Constraints, `keyof`, indexed access types, defaults and generic classes — the
toolkit behind most typed library APIs.

## Notes

**A constraint is an upper bound, not a cast.** `T extends { length: number }`
means every `T` must be *at least* that shape; inside the function you may use
`.length` and nothing else, while outside, `T` is still inferred as the caller's
specific type. That combination — restricted inside, precise outside — is why
`longest("abc", "de")` returns `string` rather than `{ length: number }`. If you
find yourself writing `T extends any` or `T extends unknown`, you have written
an unconstrained parameter with extra words.

**`keyof` has sharp edges worth knowing.** `keyof` of a type with an index
signature is `string | number` (because `obj["1"]` and `obj[1]` are the same
property in JavaScript); `keyof` of `any` is `string | number | symbol`; and
`keyof` of an empty object type is `never`, which produces the wonderfully
confusing "Argument of type 'string' is not assignable to parameter of type
'never'" when a generic fails to infer what you hoped. When you see `never` in a
key position, the real problem is usually one type parameter earlier.

**`T[K]` is an indexed access type and it distributes over unions.**
`Learner["id" | "name"]` is `string | string`, collapsed to `string`. That is
the same mechanism that makes `T[keyof T]` mean "the union of all value types",
which you will use in lesson 09. Note the syntax is always bracket notation —
`Learner.id` is not a type — and that it works with `number` for arrays and
tuples: `Learners[number]` is the element type of `Learners[]`, a genuinely
useful trick for deriving an item type from an `as const` array.

**Defaults, and where they belong.** `class Registry<T = string>` supplies a
type argument when the caller omits it. Defaults are useful for public APIs
where one type is overwhelmingly common (`Map<K, V = unknown>`-style
convenience) and for keeping a new type parameter backwards-compatible when you
add one to an existing generic. They interact with inference in one surprising
way: a default is only used when nothing else determines the parameter, so an
inferred type always wins over the default.

**Generic classes are less special than they look.** The type parameter is
fixed when the instance is constructed, so it behaves like an interface's — and
that is exactly why `static` members cannot refer to it: statics belong to the
class, not to an instance, so there is no `T` to point at. If you need a static
factory with its own type parameter, declare it on the method:
`static of<U>(value: U): Registry<U>`.

**Variance, if someone asks.** Is `Registry<string>` assignable to
`Registry<unknown>`? TypeScript's structural check answers by comparing members,
and because `Registry<T>` both accepts `T` (in `set`) and produces it (in
`get`), the safe answer is "no" — but TypeScript's default *method* bivariance
often lets it through anyway. That leniency is deliberate and pragmatic;
`strictFunctionTypes` tightens it for function-typed properties but not for
method syntax. This is a genuinely deep corner, and "TypeScript's methods are
bivariant for historical and ergonomic reasons" is a strong short answer.

## ex1 — pluck

The signature `<T, K extends keyof T>(items: readonly T[], key: K): T[K][]` is
the one to memorise. Every part of it is doing work: `T` comes from the array,
`K` is inferred as the *string literal* you passed, the constraint rejects keys
that do not exist, and `T[K]` reads the type at that key so the caller gets
`string[]` rather than `unknown[]`.

The instructive variation is `key: keyof T`, which the hint asks you to try.
It compiles, and the return type collapses to `T[keyof T][]` —
`(string | number)[]` for our learner — so every caller has to narrow. This is
the single clearest demonstration of why generic APIs use a separate `K`: the
literal type of the argument is information, and passing it through a type
parameter is how you avoid throwing it away.

Also worth noticing: `items.map((item) => item[key])` typechecks without a cast.
Indexing an unresolved `T` with an unresolved `K` is exactly the kind of thing
that needs `any` in weaker type systems, and TypeScript follows it precisely.

## ex2 — a constraint that demands structure

Writing the body first and watching `a.length` fail is the intended path,
because the error message *names the fix*: "Property 'length' does not exist on
type 'T'". Constraints are almost always discovered this way rather than
designed up front.

`{ length: number }` is a structural constraint, and it is worth appreciating
how much it accepts: strings, arrays, `NodeList`, `arguments`, typed arrays,
and any object you write with a `length` property. A nominal type system would
have needed an interface and every one of those types to declare it. Here the
constraint is just a shape, and everything that fits, fits.

The tie rule (`b.length > a.length ? b : a`) is a one-character decision with a
real consequence: `>=` returns `b` on a tie, `>` returns `a`. The gate checks
it because "stable" behaviour — equal inputs resolve consistently and
predictably — is what callers depend on when they chain these things together.

## ex3 — a generic class with a default

Three things were being trained here. First, that a class's type parameter
threads through fields and methods: `Map<string, T>`, `set(key, value: T)`,
`get(key): T | undefined`. Second, that `get` returning `T | undefined` is not
pessimism — `Map.get` genuinely can miss, and hiding that behind `T` is how
`undefined` gets into somewhere it will not be checked. Third, that a default
type argument keeps the common case terse.

There is a wider point about wrapping a `Map` at all. `Registry<T>` adds
nothing a `Map<string, T>` does not already do — which is the honest critique of
a lot of "service" classes. Where the wrapper earns its place is when it
constrains: a registry that validates keys, that refuses to overwrite, that
notifies on change. Keeping the field `private readonly` is what makes those
future invariants enforceable, and it is why the hint nudges at what happens
when you remove `private`.

## ex4 — indexBy

`Map<T[K], T>` is a satisfying little type: the key type is derived from the
property you chose, so `indexBy(learners, "id")` is a `Map<string, Learner>`
and `indexBy(learners, "streak")` is a `Map<number, Learner>` with no extra
work. Compare with the plain-object version, `Record<string, T>`, which cannot
express a numeric key honestly (object keys are strings at runtime) and cannot
hold object keys at all. When your keys are not strings, a `Map` is the right
data structure and TypeScript models it well.

The last-wins collision rule is the mirror of lesson 06's `uniqueBy`, which was
first-wins. Neither is more correct; what matters is that both are documented,
because a caller who assumes the wrong one gets *plausible* wrong data — the
worst kind. In an interview, saying "what should happen when two items share a
key?" before writing the function is a strong signal.

## challenge — getIn

`K2 extends keyof T[K1]` is the first time a constraint has referred to another
type parameter, and it is the shape that makes deep typed access work.
TypeScript resolves them left to right: `T` from the object, `K1` from the
first key literal, `T[K1]` from those two, then `K2` constrained by that.

Real libraries take this several steps further with template literal types and
recursion — `getIn(config, "server.port")` with a dotted path is a well-known
type-level exercise — and every one of them is built from the pieces you just
used. It is also where type-level code starts to have a cost: deeply recursive
path types are a common cause of slow editors and "Type instantiation is
excessively deep" errors. Two levels by hand is often the right engineering
answer.

The hint's closing question is the important one. The types guarantee the path
exists *in the type*, and guarantee nothing about the runtime value: if
`config` came from `JSON.parse`, `source[first]` can be `undefined` and
`source[first][second]` throws. Lesson 10 is entirely about that gap.

## review1 — firstWith

`value: T[K]` is the detail worth carrying away. The search value is typed by
the key you chose, so `firstWith(learners, "streak", "twelve")` is a compile
error rather than a search that silently finds nothing. Bugs of exactly that
shape — comparing a number to its string form and getting no match — are common
and hard to spot in review, and this signature makes them impossible.

`Array.prototype.find` returning `T | undefined` is a small gift: its type is
already exactly what you want, so nothing needs casting. When a standard
library function's type lines up with your signature that neatly, it usually
means you have modelled the problem the same way its designers did.

The `===` caveat in the hint is real. For object-valued properties, `===`
compares references, so `firstWith(items, "tags", ["a"])` will never match even
when the contents look identical. Fixing it properly means taking a comparator —
which is another callback, another type parameter, and a good example of how
"just one more feature" grows a signature.

## Further reading

- [Handbook: Generics — generic constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints) — constraints, using type parameters in constraints, and generic classes.
- [Handbook: `keyof` type operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) — including the index-signature and `never` edge cases.
- [Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) — `T[K]`, unions of keys, and `Arr[number]`.
- [Handbook: Classes — type parameters](https://www.typescriptlang.org/docs/handbook/2/classes.html#type-parameters) — generic classes and why statics cannot use them.
- [TypeScript Deep Dive: type inference and generics](https://basarat.gitbook.io/typescript/type-system/type-inference) — helpful when a constrained generic infers something you did not expect.
