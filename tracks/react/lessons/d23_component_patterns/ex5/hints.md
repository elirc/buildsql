## Hint 1

Two problems, both about ids. The first shows up the moment two fields appear
on one page: they are using the same id, so both labels point at the same
control and one of the fields is effectively unlabelled.

## Hint 2

`useId` gives a value that is unique per component instance, and the hint's id
can be derived from it — a suffix is enough.

## Hint 3

The second problem is what the callback is handed when there is no hint. An
`aria-describedby` pointing at an element that does not exist is worse than no
attribute at all; React omits an attribute whose value is `undefined`, which is
the behaviour to lean on here.
