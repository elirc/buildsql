## Hint 1

There is no "drop" call. A transform emits by calling `this.push(item)`, so it
drops an item by simply not doing that — and then still calls the callback,
because the callback means "I have finished with this chunk", not "here is an
output".

## Hint 2

The counters are two variables in the closure around the stream, and the two
methods that read them are attached to the object you return.

`new Transform({...})` gives you a `Transform`, so you need one cast (or an
`Object.assign`) to widen it to your `FilterStage` before you attach `kept` and
`dropped`. Keeping the state in the closure rather than as properties on the
stream is what stops a caller reaching in and resetting your counts.
