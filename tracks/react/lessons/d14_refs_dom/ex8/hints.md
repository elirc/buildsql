## Hint 1

The button the user pressed no longer exists after the click, and a browser
does not guess where the cursor should go — it puts it on the document body,
which for a keyboard user means starting again from the top of the page. Work
out the rule in words first: which row takes the place of the one that left?

## Hint 2

The decision has to be made while the old list is still around, because that is
the only moment you can look at the neighbours. The `.focus()` call has to
happen after the new list is on screen, because that is the only moment the
replacement node exists. Two different times, so store the answer in a ref in
the handler and read it in an effect keyed on the list.

## Hint 3

The map of button nodes is already being filled in by a callback ref, so
`buttons.current.get(name)` is your node. A heading is not focusable by
default — `tabIndex={-1}` makes it focusable by script without putting it in
the tab order — and the stub has already done that part for you.
