## Hint 1
The gate renders your component inside a `<dl>` and then checks that the
`<dl>`'s direct children are `dt, dd, dt, dd`. So you owe the page two
sibling elements — and, this time, you may not put a `<div>` around them,
because a `<div>` between `<dl>` and `<dt>` is invalid HTML.

## Hint 2
React has an element whose whole job is to group children and then vanish at
render time. It has a long form, `<React.Fragment>…</React.Fragment>`, and a
short form that looks like a tag with no name:

```tsx
return (
  <>
    …
    …
  </>
);
```

## Hint 3
Inside the fragment: the label belongs in a `<dt>` (a description *term*) and
the value in a `<dd>` (its *definition*) — those two elements are where the
`term` and `definition` roles the gate queries for come from. Each holds
exactly one interpolated prop and no extra text.
