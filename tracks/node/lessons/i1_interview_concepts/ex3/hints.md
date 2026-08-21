## Hint 1

`guardOnce` is a closure with one boolean in it. The wrapper checks the flag,
sets it, and forwards - and every later call returns silently.

`isOperational` is a decision procedure, and the README states it as three
rules. Write them in the order given; the order is what makes the answers
consistent.

## Hint 2

For the guard, mind the order inside the wrapper: set the flag **before** you
call the underlying callback, not after. If the callback throws (or
re-entrantly calls the wrapper), a flag set afterwards is still `false` and the
guard has failed at the one moment it mattered.

For the classifier, remember the input is `unknown`. The first question is
whether it is an `Error` at all: a thrown string or a plain object has no
stack, and treating it as anything but a bug would be generous.

## Hint 3

```ts
let called = false;
return (error, value) => {
  if (called) return;
  called = true;
  callback(error, value);
};
```

For the classifier, the three rules in order: not an `Error` -> false; marked
`isOperational` -> true; a built-in bug type (`TypeError`, `RangeError`,
`ReferenceError`, `SyntaxError`) -> false; otherwise a Node system error code
(`ECONNREFUSED`, `ENOENT`, `EACCES` - a string of capitals starting with E) ->
true; anything else -> false.

The decision left to you is how you recognise that code shape. And be ready
for the follow-up: what do you *do* with the answer? Operational errors get
handled - retried, turned into a 4xx, logged at warn. Programmer errors get
logged with the stack and the process gets restarted, because it is now in a
state its author never designed for.
