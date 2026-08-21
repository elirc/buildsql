## Hint 1
Whatever a caller writes between `<Card>` and `</Card>` arrives as a prop
called `children`. It is already destructured for you in the signature. If you
never mention it in the JSX you return, React renders everything else and
silently drops it — which is exactly what the stub does.

## Hint 2
`children` holds JSX, so it interpolates like any other value:

```tsx
return (
  <article>
    …the title, in a heading…
    {children}
  </article>
);
```

## Hint 3
The heading is level 3 (`<h3>`) and holds only the title. The one decision left
is ordering: the gate reads the rendered text and insists the title appears
before the children.
