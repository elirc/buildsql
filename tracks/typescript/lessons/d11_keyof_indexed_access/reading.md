# Reading - typescript/d11_keyof_indexed_access

The debrief. Per problem: what the key relationship was really buying, the
mistake that breaks it, and one sentence on the model answer.

## Notes

**The skill this set drills is describing a member without naming it.**
`keyof T` is the union of `T`'s keys; `T[K]` is the type stored at `K`; and the
pair `<T, K extends keyof T>` is the single most reused signature in typed
JavaScript. It appears in `lodash`, in every ORM, in every form library, and in
about half the utility functions you will write.

**`K extends keyof T` is what keeps the key literal.** Without the constraint,
`key: string` widens and `source[key]` stops typechecking; with it, calling
`getValue(item, "qty")` infers `K = "qty"` and the return type is exactly the
type of `qty`. The constraint is doing inference work, not just validation.

**Indexed access composes.** `T[K][I]` reads two levels; `T[keyof T]` unions
every value type; `T[number]` reads the element type of an array or tuple - and
on a `readonly ["a", "b"]` that is `"a" | "b"`, which is the same trick that
turned an `as const` list into a literal union back in d08.

**`Object.keys` is typed `string[]`, on purpose.** Structural typing means a
value may always carry more properties than its type declares, so the compiler
cannot promise the key list matches. Every implementation in this set therefore
contains one cast - `Object.keys(source) as (keyof T)[]`, or `{} as Pick<T, K>` -
and being able to explain *why* rather than apologising for it is the point.

**And "an object under construction" is the other recurring cast.** You cannot
declare `const picked: Pick<T, K> = {}` because an empty object is not one yet;
you assert the type up front and fill it immediately. The alternative -
`Object.fromEntries` - trades the cast for a different one and loses the key
literals on the way.

## ex1 - read one member

What this was testing: the canonical `<T, K extends keyof T>(source: T, key: K):
T[K]`. Three type positions, all connected, and a body that is one line.

The classic mistake is `key: string`, which fails to compile at `source[key]` -
and the fix people reach for is `(source as any)[key]`, which returns `any` and
poisons every call site downstream.

The model answer writes the constraint and returns `source[key]`; the interesting
work is entirely in the signature, which is exactly what the drill wants you to
notice.

## ex2 - write one member, immutably

What this was testing: the same pair used in an argument position rather than a
return position. `value: T[K]` is what rejects `setValue(item, "a", "2")`.

The classic mistake is `source[key] = value; return source;`, which mutates the
caller's object - the gate keeps the original and checks it.

The model answer spreads into a new object with a computed key,
`{ ...source, [key]: value }`, and casts the result to `T`. TypeScript widens a
computed-key spread to an index signature and cannot see that it produced a `T`,
so the cast is expected - and it is safe because `value` was already constrained
to `T[K]`.

## ex3 - collect the values

What this was testing: `T[keyof T]`, which indexes by *every* key at once and so
unions the value types. For `{ a: number; b: string }` that is `number | string`.

The classic mistake is `Object.values(source)`, which is typed `any[]` for a
generic `T` and quietly loses everything - it looks like the right answer and
returns the wrong type.

The model answer maps `Object.keys` with one cast to `keyof T`, which is the
honest version of what `Object.values` pretends to do.

## ex4 - index an array type

What this was testing: `T[number]`, the array-and-tuple form of indexed access.
On a `number[]` it is `number`; on a `readonly ["a", "b"]` it is `"a" | "b"`, and
the gate checks both so the tuple case cannot be an accident.

The classic mistake is handling the negative index with `values[index]`, which
JavaScript happily reads as the property `"-1"` and returns `undefined` - correct
by luck for out-of-range and wrong for `-1`, which should be the last element.

The model answer converts a negative index once (`values.length + index`), then
runs a single range check that also rejects fractions, so there is exactly one
place that decides whether an index is usable.

## ex5 - two levels of indexed access

What this was testing: chaining constraints. `I extends keyof T[K]` reads as "a
key of whatever lives at `K`", and it is the moment `keyof` stops feeling like
syntax and starts feeling like a small language.

The classic mistake is `I extends keyof T`, which compiles for the outer key and
rejects every inner one - the error message points at the argument rather than
at the signature, which is why it takes a minute to spot.

The model answer maps `item[outer][inner]`; the body is trivial once the three
type parameters are written down, which is the recurring shape of this whole
lesson.

## ex6 - a table read both ways

What this was testing: deriving *two* types from one value. `keyof typeof ROLES`
gives the names; `(typeof ROLES)[Role]` gives the levels; and `as const` is what
stops the second one collapsing to `number`.

The classic mistake is writing `type RoleLevel = number`, which compiles, passes
the runtime tests, and lets `roleFor(4)` through - the gate rejects exactly that
call.

The model answer looks the level up by scanning the table's keys, with one cast
on `Object.keys`, and compares roles by reading the same table - so the numbers
live in exactly one place and both functions agree by construction.

## ex7 - select columns

What this was testing: `Pick<T, K>` as a return type built from an inferred key
union. `project(rows, ["id", "name"])` infers `K = "id" | "name"` and the result
is `Pick<Row, "id" | "name">[]`, with no mention of `Row` in the call.

The classic mistake is building the object with `Object.fromEntries`, which
returns `{ [k: string]: T[K] }` and needs a broader cast that also loses the key
literals - it works, and it says less.

The model answer starts each row from `{} as Pick<T, K>` and assigns the named
keys in the order they were given, which is what makes `Object.keys` on the
result come out in that order too.

## ex8 - sort by several keys

What this was testing: `keyof T` inside a generic *interface*, plus a comparator
that has to work for values whose type it does not know. `SortKey<T>["key"]`
being `keyof T` is what rejects a typo in the sort specification.

The classic mistake is comparing with `<` directly on `a[key]`, which does not
compile for a generic value type - and the second-classic is `String(a) <
String(b)` for everything, which sorts `120` before `90`. The gate sorts a
numeric column descending to catch it.

The model answer walks the sort keys in order, returning as soon as one
distinguishes the rows, and delegates the comparison to a small helper that
handles numbers numerically and everything else as text - relying on
`Array.prototype.sort` being stable, which it has been since ES2019.

## Further reading

- [Handbook: keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) - `keyof` on objects, on index signatures, and on arrays.
- [Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) - `T[K]`, `T[keyof T]`, `T[number]` and how they chain.
- [Handbook: typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) - the `keyof typeof` pairing ex6 is built on.
- [Handbook: Pick](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys) - the utility ex7 returns, and its definition as a mapped type.
- [MDN: Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) - the stability guarantee ex8 depends on, and the comparator contract.
