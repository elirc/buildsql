## Hint 1
`role` is an ordinary HTML attribute. Everything you learned in ex2 about
attribute values in braces applies to it — including that the value can be the
result of an expression rather than a prop copied straight through.

## Hint 2
Compute the role above the `return`, the way you computed the plural noun in
lesson 00:

```tsx
const role = /* … */;
return <p role={role}>…</p>;
```

Two tones, two roles: `alert` for the urgent one, `status` for the polite one.

## Hint 3
An `alert` live region interrupts whatever a screen reader is currently saying;
a `status` region waits for a pause. That is the whole difference, and it maps
onto `tone` directly. The message is interpolated as the element's only child —
and remember `className`, not `class`, if you also want to style it.
