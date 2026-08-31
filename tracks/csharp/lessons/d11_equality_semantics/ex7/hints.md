## Hint 1

This is the full contract, written out once so you never have to guess again.
Five members, and each has a job:

- `Equals(Money?)` - the real comparison, from `IEquatable<T>`;
- `Equals(object?)` - delegates to it after a type test;
- `GetHashCode()` - built from the same fields;
- `operator ==` - handles nulls, then delegates;
- `operator !=` - `!(left == right)`.

## Hint 2

The operators are where the care goes, because they must not recurse:

```csharp
public static bool operator ==(Money? left, Money? right)
{
    if (left is null) return right is null;
    return left.Equals(right);
}
```

`left is null` rather than `left == null` - the second would call this operator
again and stack-overflow. The `is null` pattern is not sugar here; it is the
only safe test.

`Equals(Money? other)` needs `other is not null` and then the field comparison.
Compare `Currency` with `StringComparison.OrdinalIgnoreCase` and hash it the
same way - `HashCode.Combine(Amount, StringComparer.OrdinalIgnoreCase.GetHashCode(Currency))`.

The class is `sealed`, which is deliberate: it removes the inheritance question
ex8 is about, and it is what lets `Equals` use a simple type test with a clear
conscience.
