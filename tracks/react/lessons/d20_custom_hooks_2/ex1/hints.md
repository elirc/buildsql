## Hint 1

The empty dependency array is a promise that the effect reads nothing that can
change, and it reads two things that can: `key` and `handler`. The listener
goes on calling the handler from the first render for ever.

## Hint 2

Adding `handler` to the array would be honest and would also remove and re-add
a document listener on every render, since the caller almost certainly writes
the handler inline. Keep the newest one in a ref updated by its own tiny
effect, and let the listener read `ref.current` when the key is actually
pressed.
