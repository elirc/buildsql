## Hint 1

`import.meta.url` is a URL string (`file:///C:/…` or `file:///home/…`), not a
filesystem path. Two things are wrong with treating it as one: the characters
are percent-encoded, and on Windows the path is prefixed with an extra slash
before the drive letter. `node:url` has one function whose entire job is
undoing both.

## Hint 2

Three steps, in this order: URL to path, path to directory, directory joined
with the segments.

```ts
const file = /* the node:url function */ (metaUrl);
const dir = path.dirname(file);
```

Then join. `path.join` normalises `..` for you, which is why the third
assertion in the gate works without any special handling — and note what
`path.join(dir)` with no extra segments returns, because that is the no-segment
case handled for free (or not, if you decide it needs a branch).
