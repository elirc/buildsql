## Hint 1

Two `typeof` branches and a fallthrough. Everything the prompt does not name is
`null`, so write the two cases you do handle and return `null` at the end.

## Hint 2

`Number("")` is `0` and `Number("  ")` is `0` as well - JavaScript treats an
empty string as zero, and the gate checks both. Trim first, reject the empty
result, and only then convert.

`Number.isFinite` covers `NaN` and both infinities in one call, which is why
the number branch and the string branch can end the same way.

Left to you: whether `"1e3"` should be `1000`. The prompt does not say; decide
and be able to justify it, because a real parser has to.
