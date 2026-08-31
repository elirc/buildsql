## Hint 1

Two things are missing and the second is easy to overlook. The interval is
never cleared, so polling outlives the component; and every tick fires a
request whether or not the previous one has answered, so a slow server ends up
with a queue that never drains.

## Hint 2

"Is a request in flight" is not something anything on screen depends on, and it
has to be readable at the instant a tick happens rather than after the next
render — which makes it a ref, not state. Set it before the request goes out,
clear it on both the success and the failure path.

## Hint 3

The last detail is the dependency array. A caller will write the loader inline,
so listing it would restart the polling on every render — keep the newest one
in a ref and depend only on the interval.
