## Hint 1
A debounce is not a queue and it is not a comparison of timestamps. It is one
pending timer that keeps getting thrown away, and the effect lifecycle already
throws things away at exactly the right moments.

## Hint 2
React runs the previous cleanup before the next effect, so a change arriving
inside the window cancels the save that was about to go out - as long as the
cleanup clears the timeout it started. The same cleanup covers the unmount case
for free.
