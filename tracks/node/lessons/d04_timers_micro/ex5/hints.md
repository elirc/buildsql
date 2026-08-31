## Hint 1

Two timers, two jobs: one re-arming poll and one deadline that fires once. The
`new Promise` executor is the natural home for both, because both need `resolve`
and `reject` in scope.

Write the recursive `attempt` first — count, check, either settle or arm the
next one — and call it directly at the end so the first check costs nothing.

## Hint 2

A re-arming `setTimeout` and a `setInterval` both work, but only one of them
gives you a handle you can be sure is the current one. If you use `setInterval`
you clear the same handle at the end; if you re-arm with `setTimeout` you have
to keep the latest handle in a variable.

## Hint 3

One `cleanup()` used by both exit paths is what makes the last two assertions
pass. Success has to clear the *deadline* (otherwise it fires later, on a
promise that has already settled — harmless here, but it holds the process open
for the rest of the budget), and the timeout has to clear the *poll* (otherwise
the check keeps running forever on work nobody is waiting for).

The remaining decision: what happens if `check()` itself throws. The gate does
not test it; a reviewer will ask.
