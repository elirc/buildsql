## Hint 1
The markup is already right — dialog role, modal flag, named by its heading.
What is missing is everything to do with the keyboard: focus does not move in,
Escape does nothing, and focus is not handed back on close. Those three are what
an interviewer is checking for.

## Hint 2
Two refs, one for each end of the journey. Focusing the Cancel button cannot
happen in the click handler that opens the dialog — the button does not exist
yet — so it goes in an effect keyed on `open`. Restoring focus to the trigger
*can* happen directly in a handler, because that button never left the page.

```tsx
useEffect(() => { if (open) cancel.current?.focus(); }, [open]);
```

## Hint 3
Escape is a document-level `keydown` listener, subscribed only while the dialog
is open and removed by the effect's cleanup. Route every way of closing —
Cancel, Escape, Confirm — through one `close()` function, so the focus
restoration cannot be forgotten in one of them. What a real modal still owes its
users after this: trapping Tab inside it, and making the rest of the page inert.
