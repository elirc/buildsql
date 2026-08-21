## Hint 1
Two moves of focus, in opposite directions. Opening has to put focus on
something inside the dialog; closing has to put it back on the control that
opened it. That means two refs — one for each button — and both of them must
be attached before you try to use them.

## Hint 2
Focusing the close button cannot happen in the click handler that opens the
dialog: at that moment the button does not exist yet, so its ref is still
`null`. It has to happen after React has rendered the dialog, which is an
effect that runs when `open` changes:

```tsx
useEffect(() => {
  if (open) { … }
}, [open]);
```

## Hint 3
Closing is the easier direction — the Open button is already in the document,
so its ref is live and you can focus it directly in the handler that sets
`open` to false. Whether you also restore focus from an effect, and what should
happen if the dialog is closed by pressing Escape rather than the button, are
the questions a production implementation has to answer next.
