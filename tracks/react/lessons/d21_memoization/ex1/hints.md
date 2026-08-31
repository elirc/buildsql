## Hint 1

`MetricTile` is already memoized and it still renders on every tick. List its
four props and ask, for each one, whether the value passed this render is the
same *object* as last render — `memo` compares with `Object.is`, so equal
contents are not enough.

## Hint 2

The format is written between the tile's angle brackets, which means it is
built again every time the board renders. Nothing about it depends on props or
state at all, so it does not need `useMemo` — it does not even need to be
inside the component.
