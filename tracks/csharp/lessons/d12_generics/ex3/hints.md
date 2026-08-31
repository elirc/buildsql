## Hint 1

Three constraints, three different promises:

- `where T : class` - T is a reference type, so `T?` means "may be null".
- `where T : struct` - T is a non-nullable value type, so `T?` means
  `Nullable<T>` and brings `HasValue` with it.
- `where T : notnull` - T may be either, but never a nullable one. This is what
  `Dictionary<TKey, TValue>` requires of its key.

The two fallback methods have different names precisely because constraints do
**not** participate in overload resolution - two methods differing only by
constraint will not compile.

## Hint 2

```csharp
public static TRef RefOrFallback<TRef>(TRef? value, TRef fallback) where TRef : class
    => value ?? fallback;

public static TVal ValueOrFallback<TVal>(TVal? value, TVal fallback) where TVal : struct
    => value ?? fallback;
```

They look identical and are not: in the first `TRef?` is an annotation on a
reference type, in the second `TVal?` is `Nullable<TVal>`, a different type
with a different `??`.

`CountBy` is a dictionary and a loop:

```csharp
counts[key] = counts.TryGetValue(key, out int existing) ? existing + 1 : 1;
```

The `notnull` constraint is what lets `TKey` be a dictionary key without a
warning. It is worth understanding that this is a *nullability* constraint, not
a runtime one - it is enforced by the compiler's flow analysis, not by a check.
