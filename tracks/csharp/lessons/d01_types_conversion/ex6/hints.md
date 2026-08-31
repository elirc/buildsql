## Hint 1

`decimal.Parse` throws on bad input; `decimal.TryParse` returns a bool and
writes through an `out`. Text that came from a user is expected to be wrong
sometimes, so the Try-version is the right tool - an exception per bad
keystroke is both slow and noisy.

The four-argument overload is the one that lets you say which culture and which
shapes of number you will accept.

## Hint 2

```csharp
decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out amount);
```

`NumberStyles.Number` is the combination you want: leading and trailing
whitespace, a sign, a decimal point and group separators. `CultureInfo`
lives in `System.Globalization`.

Order matters before that call: reject null-or-whitespace, then `Trim`, then
strip at most one leading `"$"`. And note that a failed `TryParse` already sets
its `out` to 0 - but assigning `amount = 0m` on the first line makes that
guaranteed rather than inherited.

Left to you: whether to use `StartsWith("$", StringComparison.Ordinal)` or a
character comparison. Both are fine; the ordinal overload is the one that says
"this is a symbol, not language".
