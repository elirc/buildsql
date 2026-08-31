## Hint 1

Write the rules down before you write the loop, in the order you will check
them: count the line, skip if blank, split into exactly two fields, read the
operation, read the amount, apply it. Every failure in that list becomes a
`throw` that names the line number.

Round exactly once, at the end. Rounding each line accumulates a different
error and is the classic way a ledger drifts.

## Hint 2

Keep a `number` counter that increments at the top of the loop body - before
the blank-line `continue` - so the numbering matches what a person sees in the
file:

```csharp
foreach (string line in lines)
{
    number++;
    if (string.IsNullOrWhiteSpace(line)) continue;
    ...
}
```

`line.Split(',')` gives you the fields; anything other than two of them is
malformed. `Trim()` both fields, lower-case the operation with
`ToLowerInvariant()` (invariant because "credit" is a keyword in your format,
not a word in the user's language), and use the same
`TryParse(..., NumberStyles.Number, CultureInfo.InvariantCulture, ...)` as ex6.

Interpolation makes the message: `$"line {number}: ..."`. The gate only checks
that `"line N"` appears, so the rest of the sentence is yours - make it the one
you would want in a log.
