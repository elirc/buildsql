## Hint 1

Two methods that must agree with each other. `Equals` decides which keys are
the same; `GetHashCode` decides which bucket a key lands in. If they disagree,
a `Dictionary` puts a key in one bucket and then looks for it in another.

`Equals` takes an `object?`, so it can be handed a string, a null, or anything
else. Deal with that first.

## Hint 2

The idiomatic opening is a type-testing pattern, which rules out null and wrong
types in one go:

```csharp
return obj is CacheKey other && /* compare the two properties */;
```

`other` is only in scope when the pattern matched, and the `&&` short-circuits,
so nothing dereferences a null.

For the hash, `HashCode.Combine(Region, Id)` does the right thing — it mixes
the members' own hash codes properly. Adding or XOR-ing them by hand is a
classic source of clustering, where too many keys land in one bucket and your
dictionary degrades to a linear scan.

## Hint 3

The contract, in the order it matters:

1. Equal objects **must** return equal hash codes. (Unequal ones may collide;
   that is allowed and normal.)
2. `GetHashCode` must be stable for as long as the object is a key. Hashing a
   property that can change is how entries get lost inside a live dictionary —
   which is one reason both properties here are get-only.

Left to you: whether to also implement `IEquatable<CacheKey>` for a strongly
typed `Equals` that avoids the cast. The framework will use it when it is
there, and it is what a record generates for you behind the scenes.
