## Hint 1
Do not try to make one `<a>` behave two ways. The two cases render *different
elements*: a link when the crumb points somewhere else, and something that is
not a link at all when it points at the page you are already on.

## Hint 2
A component body is a normal function body, so an early return is allowed and
is usually the clearest thing to write:

```tsx
if (/* … */) {
  return …;
}
return …;
```

That is the honest answer to "how do I put an `if` inside JSX": you do not —
you put the JSX inside the `if`.

## Hint 3
The non-link branch still has to be findable by the gate and announced
correctly, which is what `aria-current="page"` is for: it tells assistive
technology "this is the item in the set representing the current page". Pick a
neutral element to hang it on and give it the label as its text.
