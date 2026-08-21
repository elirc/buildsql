## Hint 1

The body is not on `req`. `req` **is** the body - a `Readable` stream of the
bytes the client is still sending. So this handler cannot answer immediately:
it registers listeners and answers later, from the `"end"` callback.

Order of business: reject the wrong path (404), reject the wrong method (405,
with an `Allow` header), then read.

## Hint 2

The read loop, with the limit built in:

```ts
const chunks: Buffer[] = [];
let size = 0;
let tooLarge = false;

req.on("data", (chunk: Buffer) => {
  size += chunk.length;
  if (size > BODY_LIMIT) { tooLarge = true; return; }
  chunks.push(chunk);
});

req.on("end", () => { /* decide what to send */ });
```

Note what the limit does: it stops *keeping* the bytes, so your memory is
bounded no matter what the client sends. Checking the size only at the end
would mean you had already buffered the whole thing.

`Buffer.concat(chunks).toString("utf8")` gives you the text - one decode, at
the end, for the reason lesson 06 ex2 drilled.

## Hint 3

Inside `"end"`, in order:

```ts
if (tooLarge) { /* 413 */ return; }

let parsed: { item?: string; qty?: number };
try { parsed = JSON.parse(/* the text */); }
catch { /* 400 */ return; }

const order = { id: nextId, item: parsed.item, qty: parsed.qty };
nextId += 1;
res.setHeader("location", /* what? */);
sendJson(res, 201, order);
```

Two decisions left: the `Location` value (the gate wants `/orders/1` for the
first order) and where `nextId` lives. It has to survive between requests, so
it belongs in the closure `createHandler()` creates - the same module-state
trick as lesson 01 ex3, scoped to one handler instead of one module.
