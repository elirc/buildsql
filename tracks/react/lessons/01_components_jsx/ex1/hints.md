## Hint 1
A function returns one value, so a component returns one element. You have two
things to render — a heading and a paragraph — which means something has to
contain them. The gate tells you which element: it asks for the `banner` role.

## Hint 2
The skeleton is:

```tsx
return (
  <Something>
    …
    …
  </Something>
);
```

The parentheses after `return` are not decoration. `return` followed by a line
break inserts a semicolon for you, so `return` and `<` must share a line —
wrapping in parentheses is how everyone avoids thinking about that again.

## Hint 3
`<header>` is the element whose implicit ARIA role is `banner` when it is not
nested inside an `<article>` or `<section>`. Inside it, the title goes in an
`<h1>` and the subtitle in a `<p>`, each interpolating exactly one prop.
