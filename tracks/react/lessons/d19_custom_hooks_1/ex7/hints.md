## Hint 1

Two layers of identity have to hold. The three functions must survive a render
unchanged, and so must the object they are handed back in — a stable set of
functions inside a fresh wrapper is still a changed value to everybody
consuming it.

## Hint 2

`useCallback` for the functions, `useMemo` for the object. Write each function
with the updater form of `setItems` so that none of them needs to read the
current items, which leaves all three with empty dependency arrays.

## Hint 3

One check is about something else: removing an item that is not in the
collection must leave everything looking untouched. A setter that is handed
back the state it was given is a change React does not make — which means the
memoized object survives too, for free.
