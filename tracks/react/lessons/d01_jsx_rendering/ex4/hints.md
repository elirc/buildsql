## Hint 1
Two jobs. Compute one percentage - rounded, and safe when there is nothing to
do - and then say it twice: once as text for the reader, once as ARIA
attributes for everyone else.

## Hint 2
`role`, `aria-label`, `aria-valuenow`, `aria-valuemin` and `aria-valuemax` are
written in JSX exactly as they are in HTML, hyphens and all - they are the
exception to camelCase. Numbers in braces are fine; React stringifies them.

## Hint 3
`done / total` with a total of zero is `NaN`, and `NaN%` is what your users
would read. Decide the percentage before the JSX, in a `const`, where a guard
is one ternary rather than three.
