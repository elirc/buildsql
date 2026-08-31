## Hint 1

One effect in the queue can only ever express one deadline, and it currently
clears everything at once — so a toast that arrived half a second later gets
half a second less. Say the requirement out loud: each toast disappears a
second after **it** appeared.

## Hint 2

That is a per-toast lifetime, so it wants a per-toast component with a
per-toast effect. Give the row its own `useEffect` with its own `setTimeout`,
and a cleanup that clears it — which then also covers dismissing by hand and
unmounting the queue.

## Hint 3

Watch the row's dependency array. The callback it uses to remove itself comes
from the queue, and if that is a new function on every render the row will
re-arm its timer every render and never expire. `useCallback` in the queue
fixes it.
