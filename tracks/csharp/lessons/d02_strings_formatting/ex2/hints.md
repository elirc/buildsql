## Hint 1

Every one of these is a *format specifier* plus a culture, not string surgery.
`ToString(format, provider)` is the overload you want, and
`CultureInfo.InvariantCulture` (in `System.Globalization`) is the provider that
makes the output the same on every machine.

Look up the standard specifiers before reaching for `Replace`: `N` for numbers
with group separators, `X` for hex, and `0.0` as a custom pattern.

## Hint 2

- `"N2"` - group separators plus exactly two decimals.
- `"0.0"` - exactly one decimal, and a leading zero when the value is below 1.
- `"X4"` - upper-case hex, zero-padded to at least four digits. (`"x4"` gives
  lower case, which is why the case of the letter matters.)

The percentage needs the multiply-by-100 done by you: the built-in `"P1"`
specifier also appends a `%` but inserts a culture-specific space before it,
which is not the shape the gate asks for. Being able to say *why* you did not
use `P1` is worth as much as the answer.
