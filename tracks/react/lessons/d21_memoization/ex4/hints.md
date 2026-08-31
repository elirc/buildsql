## Hint 1

Filtering four strings is free, so this is not about saving work. `filter`
returns a **new array** every time it runs, and the memoized child compares its
props by identity — so it sees a different list on every render of the panel,
including the ones caused by a button it knows nothing about.

## Hint 2

`useMemo` has a second job that is not about speed at all: keeping a value's
identity stable so that a memoized child, or a dependency array, sees it as
unchanged. Name the two things the filtered list is made of.
