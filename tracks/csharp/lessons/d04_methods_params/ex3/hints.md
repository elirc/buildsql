## Hint 1

The Try-pattern has a contract worth stating: the bool is the *only* thing the
caller may trust when it is false. So assign both `out` parameters to 0 on the
very first line, and only write real values once every check has passed.

The checks, in order: is there text at all; does it split into exactly two
fields; do both fields parse; is `low <= high`.

## Hint 2

An `out` parameter must be definitely assigned on every path out of the method,
including the `return false` paths - which is exactly why assigning them both
up front is the tidy way rather than a defensive habit.

```csharp
low = 0; high = 0;
string[] parts = text.Split('-');
if (parts.Length != 2) return false;
```

`int.TryParse(parts[0].Trim(), NumberStyles.None, CultureInfo.InvariantCulture,
out int start)` accepts digits only - no sign, no whitespace, no separators -
which is what "non-negative whole number" means here.

Note what the split already does for you: `"-3-9"` splits into three fields, so
the length check rejects negative bounds before any parsing happens.
