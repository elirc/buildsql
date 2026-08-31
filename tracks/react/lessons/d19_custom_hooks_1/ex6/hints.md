## Hint 1

A custom hook's body is part of the component's render. Anything you write
there runs every time that component renders, for whatever reason — including a
click on a button that has nothing to do with the list.

## Hint 2

`useMemo(factory, deps)` runs the factory again only when a dependency changes.
Move the whole filtering pass inside it, `onFilter()` included, and name the
inputs the answer really depends on.

## Hint 3

Be honest in the array: the list and the query are obvious, and the callback is
a dependency too. Note that this also keeps `matches` identity-stable between
renders, which is worth as much as skipping the work.
