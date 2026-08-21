## Hint 1

Every one of these three has a `node:path` function behind it, and the whole
exercise is knowing which. Open the API docs for `node:path` and read the
one-line summaries once - there are only about a dozen functions and you will
use six of them for the rest of your career.

For the third one, the question to ask is not "does the string start with the
parent" (it does, for `/uploads-secret`) but "which way do I have to travel to
get from parent to child".

## Hint 2

`path.join(...segments)` concatenates and normalises: it uses the platform
separator and collapses doubled ones, which is both assertions in the first
group.

`path.parse(file)` returns `{ root, dir, base, name, ext }`. Two of those are
exactly what `splitName` has to return, and `ext` includes the dot.

`path.relative(from, to)` gives you the route from one path to the other. If
the child is genuinely inside the parent, that route never has to go *up* -
so it does not begin with `..`. Resolve both to absolute paths first, or a
mix of relative and absolute inputs will lie to you.

## Hint 3

```ts
export function isInside(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative !== "" && /* two more conditions */;
}
```

Three conditions in total. The empty string means the two paths are the same
(so: not inside). A route that starts with `..` means the child is above the
parent. And on Windows there is a third case that the first two miss: two
paths on different drives have no relative route at all, and `path.relative`
returns an absolute path - which is why `path.isAbsolute` earns its place in
the condition. Two of the three are yours to write.
