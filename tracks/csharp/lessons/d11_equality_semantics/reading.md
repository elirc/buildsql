# Reading - csharp/d11_equality_semantics

## Notes

"Equal" is not one question in .NET, it is five, and a type that answers them
inconsistently produces bugs that are extremely hard to see. The five are
`ReferenceEquals` (identity, never overridable), `Equals(object?)` (virtual,
the type decides), `Equals(T)` (from `IEquatable<T>`, typed and boxing-free),
`operator ==` (chosen at compile time from the static types), and
`GetHashCode` (which decides *where* the object is filed).

The rules that tie them together are short and non-negotiable. Equality must be
reflexive, symmetric and transitive. Equal objects must produce equal hash
codes. An object's hash code must not change while it is in a hash-based
collection. Every failure in this set is one of those four being broken.

The other theme is that the framework does not care which syntax you prefer.
`List<T>.Contains`, `Dictionary<K,V>`, `Distinct`, `GroupBy` and `Union` all go
through `EqualityComparer<T>.Default`, which uses `Equals` and `GetHashCode` -
never `==`. So a type whose `==` and `Equals` disagree behaves differently
depending on which collection method the caller happened to use, and nobody
will find that by reading the call site.

## ex1

Really testing: that the three questions are genuinely different.
`ReferenceEquals` is identity and cannot be overridden - which is exactly why it
exists, as the escape hatch when a type's own `Equals` is lying to you. A plain
class inherits identity for `Equals` too, and that is the *correct* default: a
type that has not said what equality means should not guess. `string` is the
counter-example everyone has internalised without noticing, because it
overloads `==` to compare characters. The classic confusion is assuming every
type does that. It is worth knowing that `"a" + "b"` is folded and interned at
compile time, so a demonstration of reference inequality needs a string built
at run time.

## ex2

Really testing: the `Equals`/`GetHashCode` pairing, and that the hash must be
derived from exactly the information the comparison uses. Compare
case-insensitively and hash case-sensitively and your `HashSet` will contain
two "equal" items, because they landed in different buckets and `Equals` was
never called. The classic mistake beyond that is
`Code.ToUpperInvariant().GetHashCode()`, which allocates a string on every hash -
`StringComparer.OrdinalIgnoreCase.GetHashCode(Code)` does the same job without
the garbage. The `obj is Isbn other` pattern folds the null test and the type
test into one, which is why it has replaced the older two-line preamble.

## ex3

Really testing: why `IEquatable<T>` exists at all. A struct already gets
correct field-by-field equality from `ValueType.Equals` - but it is implemented
with reflection, and reaching it means boxing. Implementing `IEquatable<T>`
gives `EqualityComparer<T>.Default` a typed method to call, and the boxing and
the reflection both disappear. The classic mistake is implementing the typed
`Equals` and *not* overriding `Equals(object?)`, leaving a type whose answer
depends on how it was asked. Both must exist and both must agree; the object
version delegating to the typed one is how you guarantee that.

## ex4

Really testing: that `==` is not virtual. It is resolved at compile time from
the static types of its operands, so a class that overrides `Equals` without
overloading `==` has two different notions of equality living inside it. The
sting is `List<T>.Contains`, which uses `EqualityComparer<T>.Default` and
therefore `Equals` - so the collection says the tag is present while `==` says
the two tags are different objects. Both answers are correct and they
contradict each other. The guidance follows: if a type feels like a value,
overload `==` and `!=` alongside `Equals`, or make it a `record` and let the
compiler do all five.

## ex5

Really testing: the invariant that a hash-based collection depends on and
cannot enforce. `HashSet<T>` chooses a bucket from the hash *once*, when the
item is added. Change the item afterwards and every later lookup computes the
new hash, visits the wrong bucket and finds nothing. The entry is still there -
`Count` says so, enumeration finds it - but it is unreachable by any key at
all, including a fresh key with the original name, because the object living
in that bucket has since changed. The rule: anything used as a key must be
immutable in the parts that determine its hash. Records with `init` components,
strings and value tuples are safe; a class with public setters is not.

## ex6

Really testing: `IEqualityComparer<T>` as the way to define equality from
outside a type - because the type is not yours, or because it already has a
natural equality and you need a different one here. The two methods must agree
exactly as an overridden pair must, and the reliable way to guarantee that is a
single private helper producing the comparison value, used by both. The
domain-specific trap is `(int)` versus `Math.Floor`: a cast truncates toward
zero, so -1.2 and -0.4 land in the same cell, which is not what a map means by
a grid square. And the framework really does pass nulls while probing, so a
comparer that throws on null is a comparer that crashes on real data.

## ex7

Really testing: writing the whole contract once, deliberately. Five members,
and the one that bites is `operator ==`: writing `left == null` inside it calls
the operator again and stack-overflows, so the null test must be `left is
null`. The rest is discipline - `Equals(object?)` delegates to the typed
version, `GetHashCode` is built from the same fields with the same comparison
rules, and `!=` is `!(==)`. Note that the class is `sealed`, which is not
decoration: sealing removes the inheritance question ex8 is about and is what
lets a simple type test in `Equals` be correct. Most value-like classes should
be sealed for exactly this reason.

## ex8

Really testing: the symmetry break that `is`-based equality causes under
inheritance. Written with `obj is Point2`, a `Point2` at (1,2) considers a red
`ColouredPoint` at (1,2) equal while the coloured point disagrees - so
`a.Equals(b) != b.Equals(a)`, and any collection that happens to compare them
in the other order gets a different answer. `GetType() != obj.GetType()` fixes
it by making a base and a derived instance never equal, in either direction.
That has a real cost - a test proxy or a lazy-loading subclass is never equal
to the thing it stands for - which is why `record` picks the same rule via its
`EqualityContract`, and why value-like classes are usually sealed so the
question cannot arise.

## Further reading

- [Equality comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons) - the whole map, reference versus value.
- [`Object.Equals`](https://learn.microsoft.com/en-us/dotnet/api/system.object.equals) - the reflexive/symmetric/transitive contract, spelled out.
- [`Object.GetHashCode`](https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode) - including "do not change while used as a key".
- [`IEquatable<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.iequatable-1) - and why structs want it.
- [`IEqualityComparer<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.iequalitycomparer-1) - equality from outside the type.
- [`HashCode.Combine`](https://learn.microsoft.com/en-us/dotnet/api/system.hashcode.combine) - the modern way to build one.
