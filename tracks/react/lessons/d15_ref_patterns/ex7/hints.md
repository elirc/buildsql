## Hint 1

`useRef` keeps the first value it is given — but the expression you pass it is
evaluated every render, before `useRef` gets a chance to ignore it. Say that
sentence out loud while looking at the stub's first line.

## Hint 2

Start the ref at `null` and fill it in only if it is still `null`. That check
runs during render, which is fine because it is idempotent: after the first
time it does nothing at all.

## Hint 3

The other half is the closing. Something opened on mount has to be closed on
unmount, which is a cleanup returned from an effect with an empty dependency
array — read the ref into a local before you return the cleanup, so the
function closes over the session it was born with.
