# Reading - csharp/06_structs_records

## Notes

**Why mutable structs are a footgun.** Because a struct copies on every
assignment, argument pass and collection read, a mutation can land somewhere
you did not expect. The classic demonstration: put a mutable struct in a
`List<T>` and write `list[0].Value = 5`. C# refuses to compile it, because the
indexer returns a *copy* and the assignment would be silently thrown away —
one of the few places the language protects you from a design mistake rather
than the mistake itself. Arrays are the exception (`array[0].Value = 5` works,
because array indexing gives a real reference), which means the same line
behaves differently for an array and a list. `readonly struct` sidesteps the
whole category by making mutation impossible.

**Records are classes, not magic.** `record Reading(string Sensor, int Degrees)`
compiles to a sealed-ish class with two get-only properties, a constructor, an
`Equals(Reading)` implementing `IEquatable<Reading>`, an `Equals(object)`
override, a `GetHashCode` combining the members, a `ToString` override, a
`Deconstruct`, a protected copy constructor and a `<Clone>$` method that `with`
calls. You can see all of it with a decompiler, and everything you can do by
hand you can still do — declare extra members, override `ToString`, write your
own constructor. The type is ordinary; only the boilerplate is generated.

**Record equality is member-by-member, using each member's own equality.**
Which is why two records holding equal-but-distinct `List<T>`s are not equal:
`List<T>` never overrode `Equals`. This surprises people who read "value
equality" as "deep equality". It is not deep; it is one level, delegating.

**`with` is a shallow copy, for the same reason.** It clones the record's
fields and replaces the ones you named. A field holding a reference is copied
as a reference, so both records share the object. If you need a deep copy you
write it, and the fact that nobody can write a general deep copy for you is
exactly why the language does not pretend to.

**Boxing, properly this time.** Assigning a struct to `object`, or to an
interface variable, allocates a heap box and copies the value in. `object o = someMoney;`
boxes. `IComparable c = someInt;` boxes. Calling an interface method on a
struct through a generic constrained to that interface does *not* box, which is
one of the main reasons generic constraints exist (lesson 07). Boxing matters
in hot loops and in allocation-sensitive code, and it is a [***] interview
question because it demonstrates you know that value types have somewhere else
to be.

## ex1

The signature of `Add` is the lesson: it takes a `Money` and returns a `Money`,
and there is nowhere for a mutation to happen. Compare `DateTime.AddDays`,
`string.ToUpper`, `decimal.Round` — the whole immutable-value vocabulary in
.NET looks like this, and once you notice the pattern you stop expecting
`list.Sort()`-style in-place methods from value types.

Choosing `InvalidOperationException` over `ArgumentException` is a real
distinction worth having an opinion about. `ArgumentException` says "the value
you passed is wrong"; `InvalidOperationException` says "the object is not in a
state where this makes sense". Adding EUR to GBP is arguably either, and the
framework itself is inconsistent about such calls — but the second reads better
here, because neither amount is wrong on its own.

The free memberwise `Equals` you did not write is worth pausing on: it is
implemented in `ValueType.Equals`, and for a struct containing a reference
member (the `string`) it falls back to *reflection over the fields*, which is
correct but slow. Structs used in hot paths or as dictionary keys should
override `Equals` and `GetHashCode` explicitly — or be `record struct`s, which
generate fast ones.

## ex2

Three ways of asking "the same?", three answers, and the reason is inheritance.
`ReadingClass` inherits `object.Equals`, which is `ReferenceEquals`. `Reading`
is a record, so the compiler generated an `Equals` that compares members.
Nothing about the *data* differs; only the type's opinion about identity.

The follow-up interviewers ask: "what does `==` do for a record?" Records
overload `==` to call the generated value equality, which makes them one of the
few reference types where `==` and `Equals` agree. For a plain class, `==` is
reference comparison unless someone overloaded it, and for `string` it was
overloaded to compare text — which is why `"ab" + "c" == "abc"` is true.
Knowing which of those three worlds you are in is the actual skill.

The generated `ToString` format is stable and documented:
`TypeName { Prop = value, Prop = value }`. It exists because the first thing
anyone does with a data object is print it in a log or a debugger, and
`Namespace.Reading` — what a plain class prints — helps nobody.

## ex3

`with` is the immutable-update idiom, and it matters more than it looks.
Immutable data means no method you call can change your object behind your
back, which removes an entire category of bug in concurrent and event-driven
code. The reason immutability used to be painful in C# was the boilerplate:
copying nine properties to change one. `with` deletes that boilerplate, and
that is the whole reason records exist.

`DiffersOnlyInStatus` is worth keeping in your toolkit as a pattern: *normalise
the difference away, then compare*. The by-hand alternative — comparing sku,
quantity and price — is longer, and worse, it silently stops being right when
someone adds a fourth property to `Order`. The `with`-and-compare version keeps
working, because `==` covers whatever the record holds today.

The trap in `AddOneUnit` is reading `with` as a sequence of assignments. It is
not: all the values in the braces are computed against the *original*, and one
new object is constructed from the result. If you write
`order with { Quantity = Quantity + 1 }` inside a member of the record, the
same rule applies.

## ex4

The `Equals`/`GetHashCode` contract is the most consequential unwritten rule in
.NET, and the failure mode is memorable: a dictionary that cannot find a key
you are certain you added. The mechanism is worth being able to draw. A
`Dictionary` computes `key.GetHashCode()`, reduces it to a bucket index, and
only compares (with `Equals`) the entries already in that bucket. Two equal
keys with different hash codes land in different buckets, so the comparison
that would have matched never happens.

The rules, precisely: equal objects must have equal hash codes; unequal objects
*may* share one (a collision, handled by the comparison step); and a hash code
must not change while the object is in use as a key. That last one is why keys
should be immutable — mutate a property that feeds the hash and the entry is
stranded in the old bucket forever.

`HashCode.Combine` is the modern answer to "how do I mix several members?" It
implements a proper avalanche mix, so small differences in inputs produce very
different outputs. The old folklore (`hash = hash * 31 + field.GetHashCode()`)
is fine too; XOR-ing fields is not, because `Combine(a, b)` and `Combine(b, a)`
then collide, and so does any pair of equal fields.

`obj is CacheKey other && ...` is worth reading as three checks in one: not
null, right type, and a typed variable to compare with. Before pattern
matching, this took four lines and everybody wrote at least one of them wrong.

## challenge

Positional patterns come from `Deconstruct`, which the record struct generated.
Any type can join in by writing a `Deconstruct` method with `out` parameters —
including your own classes, which is a pleasant way to make a type feel
first-class in modern C#.

Arm order in a switch expression is not a detail: arms are tested top to
bottom, so more specific patterns must come first. The compiler helps in one
direction — it warns about an arm that can never be reached because an earlier
one subsumes it — but it cannot tell you that you *meant* the origin to be
tested before the axes. Exhaustiveness is the other half: the compiler will
warn when it cannot prove every input is handled, which for two unbounded ints
means you always need a catch-all.

Where this pays off is modelling. Once you are comfortable with records plus
positional patterns, "a discriminated union and a match" becomes idiomatic C#:
a hierarchy of records and one switch expression covering them. It is not as
tight as F# or TypeScript, and it is a great deal better than a chain of `if`s
casting to concrete types.

## review1

Two ideas that trip people up for the same underlying reason: a record holds
*references*, and both its equality and its `with` stop at the reference. Two
baskets with equal-looking lists are not equal, because `List<T>` compares by
reference. A renamed basket shares its list with the original, because copying a
reference copies the arrow. One sentence — "a record's value semantics are one
level deep" — covers both, and it is a good sentence to have ready in an
interview.

The practical guidance that follows: when a record must be genuinely immutable,
make its collection members immutable too. `IReadOnlyList<string>` documents the
intent, and `ImmutableArray<T>` or `ImmutableList<T>` (in
`System.Collections.Immutable`) enforce it. A record with a `List<T>` inside is
an immutable wrapper around a mutable thing, which is often exactly the bug
report you will spend an afternoon on.

## Further reading

- [Records](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record) — what the compiler generates, including the exact `ToString` format and `with` semantics.
- [Structure types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct) — `readonly struct`, `record struct`, and the parameterless-constructor rules.
- [Choosing between class and struct](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct) — the official size/immutability/boxing guidance.
- [`Object.GetHashCode`](https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode) — the contract, spelled out, with the consequences of breaking it.
- [`HashCode.Combine`](https://learn.microsoft.com/en-us/dotnet/api/system.hashcode.combine) — the modern way to mix members.
- [Patterns](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns) — positional, property, relational and logical patterns in one reference.
- [Deconstructing tuples and other types](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/deconstruct) — how to add `Deconstruct` to your own types.
