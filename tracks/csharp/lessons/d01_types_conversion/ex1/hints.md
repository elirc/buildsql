## Hint 1

Two operators do all the work here: `/` between two ints throws the fraction
away, and `%` gives you what `/` threw away. Neither one rounds, and both
truncate *toward zero* rather than downward.

The padding is a format specifier, not string surgery: `D2` on an int means
"at least two digits, zero-filled".

## Hint 2

Peel the units off largest first, and take each remainder from the right
quantity:

```csharp
int hours = totalSeconds / 3600;
int minutes = totalSeconds % 3600 / 60;   // seconds left over, then minutes
int seconds = totalSeconds % 60;
```

`totalSeconds / 60 % 60` gets you the same minutes by a different route - pick
one and be able to explain it.

Interpolation holds format specifiers directly: `$"{minutes:D2}"`. The hours
part has no specifier because it is not padded and not wrapped at 24.
