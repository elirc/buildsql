## Hint 1

The `Promise` executor runs **synchronously**, before the constructor returns.
That is the fact the whole pattern rests on: you can assign `resolve` and
`reject` to variables declared outside it and be certain they are populated by
the time you use them.

TypeScript will not believe that on its own — `let resolve: (v: T) => void;` is
"used before assigned". The definite assignment assertion (`let resolve!: ...`)
is how you tell it you know something it does not.

## Hint 2

A native promise already ignores a second settlement, so `settled()` is the only
part that needs a flag of your own — and once you have the flag, guarding the
two methods with it costs one line each and makes the intent explicit rather
than relying on the platform.

Nothing here needs to *do* anything asynchronous. The "handlers never run
synchronously" requirement is a guarantee the promise gives you for free; the
gate checks it to make sure you did not build the thing out of callbacks.
