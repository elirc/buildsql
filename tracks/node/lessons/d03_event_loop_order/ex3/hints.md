## Hint 1

Translate each `await` into the thing it is shorthand for: everything before it
runs now, everything after it is a callback attached to whatever was awaited.
So an `async` function is really "run this bit, then queue the rest".

Start by writing down only the labels that appear before any `await` in the call
chain. That is your synchronous prefix, and there are three lines in it.

## Hint 2

The two `.then` handlers are not queued at the same time. Registering
`.then(a).then(b)` queues only `a`; `b` is queued when `a` returns, because only
then does the intermediate promise settle. One microtask per link.

## Hint 3

Now the interesting part, and the reason this snippet exists.
`await null` resumes on the next microtask — one hop. `await somePromise` has to
*adopt* that promise first, and adopting costs an extra hop.

So count carefully: `inner` finishes on hop 1, and `outer` is waiting on
`inner`'s promise. Does `outer` resume on hop 2, or does something else that was
queued at hop 1 get there first? Write both orders down and pick the one your
model of adoption predicts — then run it and find out whether your model was
right.
