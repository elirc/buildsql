## Hint 1

`IEqualityComparer<string>` has two members and they have to agree with each
other. Work out what `GetHashCode` must do given that `"Ada"` and `"ADA"` are
equal - two equal values that hash differently land in different buckets and a
`HashSet` never notices they match.

`FirstOfEach` is an iterator method. The word is `yield`.

## Hint 2

```csharp
public bool Equals(string? x, string? y) => string.Equals(x, y, StringComparison.OrdinalIgnoreCase);
public int GetHashCode(string value) => value.ToUpperInvariant().GetHashCode();
```

Normalising before hashing is the usual trick: upper-case both and the hashes
agree because the strings do. (`StringComparer.OrdinalIgnoreCase` would do the
whole job for you, and writing it out once is worth more here.)

```csharp
HashSet<string> seen = new HashSet<string>(comparer);
foreach (string item in source)
{
    if (seen.Add(item)) { yield return item; }
}
```

`HashSet` takes a comparer in its constructor, and `Add` returns false when the
item was already there - so one call both tests and records.

`yield return` is what makes it lazy: the body does not run until somebody
enumerates the result, and it stops as soon as they stop asking.
