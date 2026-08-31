## Hint 1

Overriding `Equals(object?)` means you must override `GetHashCode` too, and the
rule joining them is one-directional: **equal objects must return the same hash
code**; unequal objects may share one.

So work out the comparison rule first, then build the hash from exactly the
same information. Here the rule is "same code, ignoring case".

## Hint 2

```csharp
public override bool Equals(object? obj) =>
    obj is Isbn other && string.Equals(Code, other.Code, StringComparison.OrdinalIgnoreCase);

public override int GetHashCode() =>
    StringComparer.OrdinalIgnoreCase.GetHashCode(Code);
```

`StringComparer.OrdinalIgnoreCase.GetHashCode(Code)` rather than
`Code.ToUpperInvariant().GetHashCode()`: the second allocates a string on every
hash, and a dictionary lookup in a loop turns that into real garbage.

The `is` pattern handles both the null case and the wrong-type case in one
test, which is why it has replaced the older `if (obj == null || GetType() !=
obj.GetType())` preamble for sealed-ish types.

Left to you: whether `Equals` should use `obj is Isbn` or
`GetType() == obj.GetType()`. They differ only when someone derives from
`Isbn` - which ex8 is entirely about.
