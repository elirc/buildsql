## Hint 1

The new element here is the immediately-invoked async function. The rule to
apply is that an `async` function body runs **synchronously** until its first
`await`, and everything after that `await` is a microtask.

So one of the labels inside that function belongs in your synchronous group
and one does not. Split them before you think about anything else.

## Hint 2

Three things are queued during the synchronous pass: the continuation of the
async function (a microtask, queued when it reaches `await null`), a
`process.nextTick`, and a `setTimeout`.

`job.then(...)` is registered while `job` is still pending, so its callback is
not queued yet - it gets queued when `job` settles, which happens when the
async function returns. That is *during* the microtask drain, so it joins the
back of the same queue.

## Hint 3

Seven labels. Group them:

- synchronous: three labels, in source order;
- the nextTick queue: one label;
- the microtask queue: the continuation, and then the `.then` callback that
  the continuation causes to be queued;
- the timer: one label.

The decision left to you is the relative order of those last two microtasks,
and the exact text of the label the `.then` callback logs - look at what the
async function returns and at how the template literal in the snippet uses it.
