## Hint 1

Toggling one row re-renders all of them. Three of the row's four props are
fine — the item object comes from the array unchanged, `done` is a boolean,
`onRender` comes from above. The fourth is written inside the `map`.

## Hint 2

`onToggle={() => toggle(item.id)}` creates a function per row on every render
of the list, so every row's props differ from last time. Look at what the row
already does with `onToggle`: it calls it with its own id.

## Hint 3

That means the list can pass **one** function to every row — the same object
for all of them, and the same object next render. `useCallback` with an empty
dependency array works because the updater form of the setter means the
function never has to read the current state.
