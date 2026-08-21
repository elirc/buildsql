## Hint 1
Four requirements, and only one of them is about layout. The wrapper needs a
role, a modal flag, and a *name*; the children go inside it; and there is a
close button that calls a prop. Work through them one at a time and rerun the
gate after each.

## Hint 2
A dialog's accessible name is normally taken from `aria-labelledby`, which
holds the `id` of the element containing the title:

```tsx
<div role="dialog" aria-modal="true" aria-labelledby={someId}>
  <h2 id={someId}>{title}</h2>
```

Both ends must use the same id, and the id must be unique on the page — so
hard-coding `"modal-title"` breaks the moment two dialogs are open.

## Hint 3
React ships a hook for exactly this: `useId()` returns a string that is stable
across renders and unique per component instance. Call it once at the top of
the component and use the result in both places. That leaves you the close
button — a real `<button type="button">` whose accessible name is `Close`, with
`onClose` wired to `onClick`.
