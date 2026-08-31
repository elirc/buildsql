## Hint 1
Two jobs the stub does not do: announce the problems as a group, and put the
keyboard where the first problem is. Neither is decoration - they are what makes
a long form usable without a mouse.

## Hint 2
`role="alert"` is the announcement. For the focus, you need a handle on the real
DOM node of each input, which is what `useRef` plus the `ref` prop gives you.

## Hint 3
Validate into a record keyed by field name rather than a flat list, and keep one
array that fixes the field order. Then the summary and the field to focus are
both reads of the same record - and you still have to decide when to move focus,
because doing it on every render would trap the user.
