## Hint 1
Two separate problems. One is the default: when the caller omits `max`, the
prop arrives as `undefined`, and `undefined out of stars` is what your label
will say unless you supply a fallback. The other is that a row of star
characters is a *picture*, and pictures need a name.

## Hint 2
Defaults go in the destructuring pattern, not in the type:

```tsx
export function Rating({ value, max = 5 }: { value: number; max?: number }) {
```

That fires only when the prop is `undefined`, which is what you want — passing
`max={0}` explicitly should mean zero, not five.

## Hint 3
Give the wrapper `role="img"` and an `aria-label` built with a template
literal, so the whole run of characters is announced as one image with the name
`3 out of 5 stars`. For the visible content, `"x".repeat(n)` builds a repeated
string; the gate only requires that a sighted user sees one filled star per
point, so whether you also draw the empty ones is your call.
