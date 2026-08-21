## Hint 1

You are bridging two worlds: an emitter that pushes events at you, and a
promise that settles once. The `Promise` constructor is the bridge, because it
hands you `resolve` and `reject` to call from inside your listeners.

Three listeners: one that collects, one that finishes, one that fails. And a
fourth thing that is not a listener - the cleanup that removes all three.

## Hint 2

Name your listeners rather than passing inline arrows, because `off` needs the
*same function reference* you passed to `on`. This is the number one reason
"I removed the listener and it still fires" happens:

```ts
source.on("data", (item) => items.push(item));
source.off("data", (item) => items.push(item));   // a different function!
```

Write a `cleanup()` that calls `off` for all three, and call it from both the
end path and the error path before you settle.

## Hint 3

The skeleton:

```ts
return new Promise<T[]>((resolve, reject) => {
  const items: T[] = [];

  const onData = (item: T): void => { items.push(item); };
  const onEnd = (): void => { cleanup(); resolve(items); };
  const onError = (error: Error): void => { cleanup(); /* ? */ };
  const cleanup = (): void => { /* three off() calls */ };

  source.on("data", onData);
  source.once("end", onEnd);
  source.once("error", onError);
});
```

Two decisions left: what `onError` does with the error, and whether `once` or
`on` is right for each of the three. (`once` already removes its own listener
after firing, which makes `cleanup` partly redundant - and still worth writing,
because the *other* two listeners are the ones that leak.)
