# Reading - typescript/d14_mapped_types

The debrief. Per problem: what the map was really doing, the mistake that looks
right, and one sentence on the model answer.

## Notes

**A mapped type is one loop with four levers**, and this set pulls each of them
in isolation before combining them. The levers: what the *key set* is (usually
`keyof T`, but any union of keys works - ex6); what happens to the *value*
(`T[K]` untouched, widened with `| null`, wrapped in an object - ex1, ex3);
what happens to the *modifiers* (`readonly` and `?`, added or removed with `+`
and `-` - ex2); and what happens to the *key itself* (`as` remapping, which can
rename with a template literal or delete by producing `never` - ex4, ex5, ex7).

Keep the homomorphic rule from lesson 09 in view while you work: the plain form
`{ [K in keyof T]: ... }` silently preserves each member's `readonly` and `?`.
That is a feature right up until you wanted them gone - ex2's stub is exactly
that failure - and it is lost the moment you remap keys, which is why ex7's
inverted table comes out clean of modifiers.

The two hard problems are hard for type-level reasons worth naming. Inversion
(ex7) uses `as T[K]`: the *value* type becomes the key, which is legal only
because the constraint promises every value is a `PropertyKey`. And ex8 turns a
mapped type inside out - map each key to itself-or-`never`, then index with
`[keyof T]` to collapse the object into a union. That map-then-index idiom is
how most "which keys...?" utilities in real codebases are written.

## ex1 - Nullable

What this was testing: the simplest possible value rewrite - `T[K] | null` -
and that you resist doing anything else to the type while you are in there.

The classic mistake is reaching for `?` instead of `| null`: an optional member
may be *absent*, which is a different contract from "present but null", and the
gate's equality assertion tells them apart.

The model answer is `{ [K in keyof T]: T[K] | null }`, homomorphic on purpose
so keys and modifiers ride through untouched.

## ex2 - Locked

What this was testing: two modifiers on one mapped type - `readonly` written
before the bracket, `-?` written after it - and the knowledge that they are
independent levers.

The classic mistake is the stub: locking without `-?`. Because the plain map is
homomorphic, every `?` survives, and `Locked<Prefs>` still allows an absent
`theme` on an object that claims to be fully resolved.

The model answer is `{ readonly [K in keyof T]-?: T[K] }` - one line, both
levers, no second pass.

## ex3 - Boxed

What this was testing: the value position of a mapped type can be any type
expression that mentions `T[K]`, including a brand-new object type built around
it.

The classic mistake is defining a separate `Box<V>` and mapping to `Box<any>`
or `Box<unknown>` - the wrapper survives but the connection to the member's own
type is cut, and `boxed.count.value` comes out `unknown`.

The model answer writes `{ value: T[K] }` inline (a named `Box<V>` used as
`Box<T[K]>` is just as good), keeping each box tied to its own member.

## ex4 - Watchers

What this was testing: key remapping with `as` plus a template literal - the
`` `${K}Changed` `` suffix pattern - and the `keyof T & string` intersection
that template literals force on you.

The classic mistake is forgetting that intersection: `keyof T` may include
`number | symbol`, which cannot be spliced into a template literal, and the
error message it produces is famously unhelpful. The second mistake is mapping
values to callbacks but leaving the names alone, which is the stub.

The model answer is `[K in keyof T & string as `${K}Changed`]: (value: T[K]) =>
void` - and the probe on `watchers.title` proves the old names really are gone,
not merely joined by new ones.

## ex5 - PickByType

What this was testing: the remap-to-`never`-deletes idiom, driven by a
conditional on the *value* type: `as T[K] extends V ? K : never`.

The classic mistake is putting the conditional in the value position instead of
the key position - `T[K] extends V ? T[K] : never` keeps every key and fills
the losers with `never`, which is a very different (and mostly useless) type.
Where the conditional sits decides whether you filter members or mangle values.

The model answer filters in the key position and leaves the value as plain
`T[K]`, so the members that survive are exactly what they were before.

## ex6 - Toggles

What this was testing: a mapped type over a plain union - no `keyof` in sight -
plus one intrinsic. `[P in K]` iterates `"audio" | "video"` directly, and
`Capitalize<P>` shapes the new name inside the template literal.

The classic mistake is trying to route through an object first (`keyof
Record<K, ...>`) or reaching for `Uppercase` and producing `hasAUDIO`. The four
intrinsics do four different jobs; this one needs only the first letter raised.

The model answer is `{ [P in K as `has${Capitalize<P>}`]: boolean }`, and the
probe on `toggles.audio` checks the raw names never leaked into the result.

## ex7 - Invert

What this was testing: `as T[K]` - remapping each key to its own *value*. The
key and value positions swap roles, which is legal because the constraint
`Record<string, PropertyKey>` promises every value can serve as a key.

The classic mistake is writing the swap in the value position only (the stub:
`{ [K in keyof T]: K }`), which relabels values but moves nothing - or dropping
the constraint and watching `as T[K]` fail, because an arbitrary value type has
no business being a key.

The model answer is `{ [K in keyof T as T[K]]: K }`: three tokens moved, whole
meaning reversed - and it handles the numeric table for free, since numbers are
already `PropertyKey`s.

## ex8 - OptionalKeys

What this was testing: the map-then-index idiom, plus the `{} extends Pick<T,
K>` probe. `Pick<T, K>` isolates one member; if the empty object satisfies it,
that member was optional; collapse the survivors with `[keyof T]`.

The classic mistake is testing `undefined extends T[K]`, which confuses "may be
absent" with "may hold undefined" - a required `title: string | undefined`
would be misreported as optional. Absence is a property of the *key*, not the
value, which is why the probe is phrased with `Pick` and `{}`.

The model answer maps with `-?` (so the collected union is clean of
`undefined`), keeps `K` for optional members and `never` for required ones, and
indexes with `[keyof T]` - `never` vanishes from the union, which is what makes
the all-required case come out as `never`.

## Further reading

- [Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) - modifiers, key remapping via `as`, and mapping over arbitrary unions.
- [Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) - the `${K}Changed` pattern and the four intrinsic string types.
- [Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) - the `? K : never` filter that drives ex5 and ex8.
- [Handbook: keyof and Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) - the `[keyof T]` collapse that turns ex8's map into a union.
