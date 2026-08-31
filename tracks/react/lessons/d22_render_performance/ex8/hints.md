## Hint 1

Three separate things are wrong, and it is worth naming them before touching
anything: the sort runs on every render, the rows are not memoized at all, and
each row is handed a fresh `onStar` built inside the `map`.

## Hint 2

Sorting and filtering are two steps with two different sets of inputs. Give
each its own `useMemo` and be exact about the dependencies — the sort depends
on the rows and the direction, the filter depends on the sorted rows and the
query. Typing then cannot cost a sort.

## Hint 3

For the rows, everything from the memoization set applies at once: wrap the row
in `memo`, pass one `useCallback` handler shared by all of them, and let the row
call it with its own id. All four props have to be stable, or the memo is a
comparison that never succeeds.
