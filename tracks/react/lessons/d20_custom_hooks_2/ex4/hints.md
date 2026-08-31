## Hint 1

The stub delays every call by 500ms and sends all of them. A debounce sends
one — which means each call has to cancel whatever was already scheduled, and
that means keeping the id `setTimeout` handed back.

## Hint 2

The id has to survive renders without causing them, so it belongs in a ref, not
in state. While you are there, note the second thing a ref gives you: the
cleanup that clears a pending timeout when the component unmounts.

## Hint 3

The returned function must be the same object every render, so `fn` cannot be
in its dependency array — and it still has to call the newest `fn`. That is the
same latest-in-a-ref trick as exercise 1, applied to the function instead of
the handler.
