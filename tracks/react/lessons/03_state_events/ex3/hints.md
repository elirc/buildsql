## Hint 1
A like button is a *toggle button*: one control with two states, not two
controls. Its label never changes — what changes is an attribute that says
whether it is currently pressed. Start from `useState(false)`.

## Hint 2
`aria-pressed` takes a boolean in JSX and React renders it as the string
`"true"` or `"false"`:

```tsx
<button type="button" aria-pressed={liked} …>
```

Note that this is one of the few attributes where rendering `false` is
meaningful — React only drops `false` for *its own* boolean DOM properties, not
for `aria-*`, which are always strings.

## Hint 3
For the handler, "the opposite of what it was" is exactly the situation the
updater form is for. Writing `setLiked(!liked)` happens to work here, but the
updater version is right for the same reason it was right in ex2, and costs
nothing.
