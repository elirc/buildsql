## Hint 1

Two words change in the signature and one thing changes in your head: an `async`
function always returns a promise, so its declared return type has to be one
too.

The failure case is a rejection, not a returned `null` - and a rejection is
just a thrown error inside an async function.

## Hint 2

```ts
export async function load(id: string): Promise<Thing> {
  ...
  throw new Error("nope");   // rejects the promise
}
```

`Promise<Lesson>` is the return type; inside the body you return a plain
`Lesson` and TypeScript wraps it for you. Note that `Promise<Lesson>` and
`async` are independent - a non-async function returning a promise is typed the
same way.

The lookup can miss, so check for `undefined` before returning.

## Hint 3

Make it `async`, declare `Promise<Lesson>`, look the slug up in `LESSONS`,
`throw new Error(...)` with the exact message from the README when the lookup
misses, and return the lesson otherwise.

Left to you: whether to reject or to resolve with `null` for a missing lesson.
This one rejects, which keeps the resolved type clean - and pushes the decision
into the caller's `try`/`catch`, where lesson 10's `Result` type is often the
nicer answer.
