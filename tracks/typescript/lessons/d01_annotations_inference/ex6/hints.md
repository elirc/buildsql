## Hint 1

A tuple again, but this time the three slots hold three different types. That
is the whole reason tuples exist: an array type can only say what *every*
element is, a tuple says what each *position* is.

## Hint 2

`row.split(",")` then `.map((field) => field.trim())` gets the raw fields.
After that, slot 0 is the trimmed text, slot 2 is a comparison against the
exact string `"true"`, and slot 1 needs a guard - `Number("")` is `0` and
`Number("warm")` is `NaN`, and neither is a temperature you were handed.

Left to you: `Number.isFinite(Number(raw))` or a regular expression for the
numeric check. They disagree on `"1e3"` - decide whether that is a reading.
