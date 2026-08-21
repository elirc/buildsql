## Hint 1
`header` and `footer` are not strings — the gate passes whole elements,
`<h2>Billing</h2>` and a `<button>`. A prop can hold JSX because JSX is a
value, and `children` is only special in that it has syntax of its own.

## Hint 2
Render all three the same way you rendered `children` in ex1:

```tsx
<section>
  <div className="panel-header">{header}</div>
  …
</section>
```

The wrapper divs are yours to keep or drop; nothing in the gate looks for them.

## Hint 3
The only thing `Panel` actually decides is the order: header, then children,
then footer. Do not try to reformat what you were given — a slot component that
inspects or rewrites the JSX handed to it stops being reusable, which is the
whole point of the pattern.
