## Hint 1

A struct inherits `ValueType.Equals`, which compares fields - correctly, but by
reflection, which is slow. `IEquatable<T>` gives the framework a strongly typed
`Equals(T)` to call instead, and generic collections look for it.

You need three members: `Equals(Gram)`, `Equals(object?)` and `GetHashCode()`.
The first is the real one; the second delegates to it.

## Hint 2

```csharp
public bool Equals(Gram other) => Value == other.Value;
public override bool Equals(object? obj) => obj is Gram other && Equals(other);
public override int GetHashCode() => Value.GetHashCode();
```

The `Equals(object?)` override matters even though it looks redundant: code
that only knows `object` - the non-generic collections, `object.Equals(a, b)` -
will call it, and if it disagreed with the typed version you would have a type
whose answer depends on how it was asked.

The performance point is worth being able to state. Without `IEquatable<Gram>`,
`HashSet<Gram>.Contains` reaches `Equals(object?)`, which means **boxing** the
struct on every comparison. With it, `EqualityComparer<Gram>.Default` finds the
typed method and no boxing happens at all. That is the single best reason to
implement the interface on a struct.
