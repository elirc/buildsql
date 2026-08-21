## Hint 1

This is the most-asked TypeScript design question there is, and the answer is
always the same shape: an interface mapping event names to payload types, then
`keyof` and an indexed access type to tie `on` and `emit` together.

Get the two signatures right before you write a line of the bodies.

## Hint 2

```ts
on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): () => void;
emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void;
```

Storage is a `Map` from event name to a set of handlers. The types inside that
map cannot be precise - handlers for different events have different parameter
types - so store them loosely and cast at the two edges, which is what every
real implementation does.

`on` returns an unsubscribe function; closing over the set and the handler is
all it takes.

## Hint 3

Give the class a `private readonly handlers = new Map<keyof EventMap, Set<...>>()`,
create the set lazily in `on`, add the handler, and return an arrow that deletes
it. In `emit`, look the set up, return early when it is missing, and call each
handler with the payload - iterating a copy, so a handler that unsubscribes
during dispatch cannot break the loop.

Left to you: whether `emit` should catch a throwing handler. Node's EventEmitter
does not; most application-level emitters should. Say which you chose and why.
