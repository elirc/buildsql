## Hint 1

Two halves: get three values out of the text, then build one string from them.
Do not try to do both in one expression.

The middle field is money and the last field is a count, so they do not become
the same type. Read the expected output and ask which of the three fields is
still a `string` when you print it.

## Hint 2

`line.Split('|')` gives you a `string[]` of length three. Index 0 is the name,
1 the unit price, 2 the quantity.

`decimal.Parse` and `int.Parse` both take an optional `IFormatProvider`. Pass
`CultureInfo.InvariantCulture` — the `using System.Globalization;` at the top
of the file is there for exactly this. On a machine whose locale writes
`19,99`, parsing `"19.99"` without it either throws or silently reads 1999.

Printing has the same problem in reverse: `total.ToString("0.00", CultureInfo.InvariantCulture)`.

## Hint 3

The shape is:

```csharp
string[] fields = line.Split('|');
decimal unitPrice = decimal.Parse(fields[1], CultureInfo.InvariantCulture);
int quantity = /* the same idea, one field along */;

decimal total = /* multiply, then round to 2 places away from zero */;
return $"{fields[0]} x{quantity} = ${/* two-decimal-place text */}";
```

Mind the `$` twice in that last line: one starts the interpolated string, and
the other is the literal dollar sign in the output. `"$"` inside an
interpolated string is just a character; only `$` *before* the quote is
special.
