## Hint 1

`readonly struct` means the compiler will reject any attempt to assign a field
after construction - so `Darken` cannot adjust this instance and must return a
new `Rgb`.

The hex formatting is d02 ex2's `"X2"` specifier, three times.

## Hint 2

A small private helper keeps `Darken` readable:

```csharp
private static byte Reduce(byte channel, int amount) => (byte)Math.Max(0, channel - amount);
```

The cast matters: `channel - amount` is an `int` (byte arithmetic always
promotes), so it has to be narrowed back. And the `Math.Max` has to happen
*before* the cast, or a negative result wraps round to a large byte - which is
d01 ex8's lesson arriving in colour.

`Hex` is `"#" + Red.ToString("X2", CultureInfo.InvariantCulture) + ...`.
`ToString()` just returns `Hex`.

Left to you: whether `Darken` should clamp or throw for a negative amount. The
gate does not test it; decide and be able to say why.
