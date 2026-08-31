## Hint 1
The stub calls `onRing` while the component is rendering. Ask when you want it
to run instead, and what you have to hand React so that React can be the one to
run it later.

## Hint 2
`onClick` takes a function. `onClick={onRing()}` and a bare `onRing()` in the
body are the same mistake wearing different clothes: both call now and hand the
result over. Pass the function itself, or wrap it in one of your own.
