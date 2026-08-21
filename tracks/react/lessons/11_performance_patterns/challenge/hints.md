## Hint 1
The table already works — the filtering, the sorting and the count are all
correct. What fails is the render count: every keystroke in the filter box
re-renders every surviving row. Fix that without changing any of the visible
behaviour.

## Hint 2
Two of the three tools from this lesson apply. `Row` needs `memo`, so that a
row whose props did not change is skipped. And the derived list wants `useMemo`
so the filter-and-sort is not redone on renders that changed nothing relevant.

The third tool, `useCallback`, is not needed here — look at where `onRowRender`
comes from and you will see why.

## Hint 3
`memo` will only help if every prop a row receives is stable between renders,
so check what you are passing: the `product` objects come straight out of the
`products` prop and keep their identity, but anything you *build* in the map —
an inline `onClick`, an object of styles, an array of tags — would be new each
time and would defeat it. Note also that `filter` is in the memo's dependency
list, so the list really is recomputed per keystroke; that is correct, and it is
the rows, not the list, that this exercise is protecting.
