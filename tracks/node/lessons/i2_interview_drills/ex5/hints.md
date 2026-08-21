## Hint 1

Both directions are adapters, and both return a *function* - nothing happens
until the returned function is called.

`promisify`: return a function that builds a promise and calls the original
with a callback that resolves or rejects it. You wrote this in lesson 03 ex1;
the drill is doing it again without looking.

`callbackify`: return a function that calls the async one and attaches
handlers that invoke the callback error-first.

## Hint 2

The detail the gate checks, and the one an interviewer will probe: the
callback must **not** be called synchronously, even when the promise is
already settled. You get that for free from `.then()`, because promise
handlers always run in a microtask - never in the same turn as the call.

That is why `fn(arg).then(onOk, onErr)` is the right shape and
`try { const value = await fn(arg); callback(null, value) } catch ...` inside
a non-async wrapper is not (and if you make the wrapper `async`, it returns a
promise nobody awaits, which is a floating rejection waiting to happen).

## Hint 3

```ts
return (arg, callback) => {
  fn(arg).then(
    (value) => callback(null, value),
    (error) => callback(/* error-first: what goes here? */),
  );
};
```

Two decisions left: what you pass on the failure path (the convention wants an
`Error` first and nothing else - and anything at all can be thrown in
JavaScript, so a defensive conversion is worth a sentence in the room), and
whether you use `.then(a, b)` or `.then(a).catch(b)`. They differ: the chained
`catch` also catches an error thrown by your own success handler, which would
call the callback twice. Say that and you have answered the follow-up before
it is asked.
