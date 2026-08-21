## Hint 1

Start from the plain emitter you built in lesson 04: a
`Map<string, Listener[]>`, `on` appends, `off` removes by identity, `emit`
walks a **copy** of the array so a listener that unsubscribes itself does not
skip the next one.

Then add the two things that are new here: wildcards, and a return value from
`emit`.

## Hint 2

A wildcard listener is registered under the literal key `"*"` and is called
for every event - but with the event name as its **first** argument, ahead of
the payload. So `emit` has two passes: the exact listeners with `...args`, and
then the `"*"` listeners with `(event, ...args)`.

`emit` returns how many listeners it called in total. That is more useful than
the boolean the real `EventEmitter` returns and it makes the gate precise.

`once` needs the same wrapper trick as before: the thing registered is not the
function the caller gave you, so `off` has to be able to find its way back.

## Hint 3

```ts
emit(event, ...args) {
  let called = 0;
  for (const listener of [...(listeners.get(event) ?? [])]) {
    listener(...args);
    called += 1;
  }
  for (const listener of [...(listeners.get("*") ?? [])]) {
    listener(/* what comes first? */);
    called += 1;
  }
  return called;
}
```

Two decisions left: the wildcard argument list, and whether a `"*"` listener
should also fire when someone emits the literal event `"*"` (the gate does not
test it - decide on purpose and be able to defend it). Worth saying in the
room: wildcards make a bus convenient and make it hard to know who is
listening, which is why most production buses log or namespace them.
