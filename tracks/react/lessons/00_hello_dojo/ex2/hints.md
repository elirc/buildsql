## Hint 1
Read the three expected strings again. Two of them end in `lessons` and one
ends in `lesson`. English pluralises on "is it exactly one", not on "is it more
than one" — so zero is plural, the same as fifteen.

## Hint 2
Compute the noun *before* the `return`, as an ordinary JavaScript `const`, and
then interpolate it. A conditional expression is the usual tool:

```tsx
const noun = /* … */ ? "lesson" : "lessons";
```

Nothing about this is React-specific. The body of a component is just a
function body until you reach the `return`.

## Hint 3
The condition is an equality check against `1` — not `> 1`, which is right for
15, right for 1, and wrong for 0. In the JSX, remember that
`{track}: {lessons} {noun}` produces three interpolations separated by the
literal text `: ` and a space; if you split that across several lines, JSX
collapses the line breaks into single spaces for you.
