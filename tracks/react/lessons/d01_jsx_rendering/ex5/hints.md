## Hint 1
Work out the string first and render it second. A `const` above the `return`
keeps the JSX readable and gives you somewhere to put the two cases.

## Hint 2
Three details decide this one: the comparison is strictly greater than the
limit, `slice(0, limit)` takes exactly that many characters, and a slice that
ends mid-space needs its end trimmed before the dots are appended.
