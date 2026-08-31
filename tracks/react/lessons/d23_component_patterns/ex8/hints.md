## Hint 1

Everything this exercise wants is a connection between two components the
caller wrote separately: the open flag, the id linking them, and a ref to the
trigger so focus can come back. All three belong to the one component that
contains them both, published through a context.

## Hint 2

The trigger needs `aria-expanded` and, while the content exists,
`aria-controls` pointing at the content's id — `useId` in `Popover` is where
that id comes from. Set `aria-controls` only while it is open, or it points at
nothing.

## Hint 3

Focus is the hard half, and it is two separate moments. Opening: an effect
keyed on `open` finds the first focusable element inside the content and
focuses it. Closing: the element that had focus is about to be removed, so the
close handler sends focus back to the trigger — which is why `Popover` keeps a
ref to it rather than the trigger keeping one for itself.
