## Hint 1
The dependency array in the stub is honest - the effect really does read
`load`. The trouble is that the parent writes a new arrow function every
render, so an honest array refetches forever. That loop is one of the two
classic `useEffect` disasters.

## Hint 2
Deleting `load` from the array without changing anything else leaves the effect
holding the first render-s function forever, which is a stale closure. You need
the latest function *and* a dependency list that does not mention it.

## Hint 3
A ref updated in its own dependency-free effect always holds the newest value,
and reading `.current` inside the fetching effect does not make it a
dependency. Decide for yourself where the read belongs - and keep the guard
that stops a late answer to an abandoned id from winning.
