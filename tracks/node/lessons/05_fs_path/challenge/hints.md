## Hint 1

This is ex2, ex3 and ex4 in a trench coat: walk the tree, read and parse each
file, write one summary out. Copy your ex3 walker into this file - the
exercises are deliberately isolated, so importing from a sibling exercise is
not the idea.

Do the whole read pass before you write anything. A pipeline that writes as it
goes leaves a half-built index behind when file 400 turns out to be corrupt.

## Hint 2

Three details the gate is specific about.

**Skip `index.json` itself.** You are writing it into the same directory you
are reading, so the second run would index its own output.

**Sort by `id`,** not by filename: the fixture is deliberately arranged so
those two orders differ.

**Name the file in the error.** Wrap the parse in a `try`/`catch` and throw a
new error whose message contains the relative path - and pass the original as
`{ cause: error }`, which is exactly what you built in lesson 04.

## Hint 3

The skeleton:

```ts
for (const relative of await jsonFiles(dir)) {
  if (relative === "index.json") continue;
  const text = await readFile(path.join(dir, ...relative.split("/")), "utf8");
  try {
    /* parse and push { id, title } */
  } catch (error) {
    throw new Error(`${relative} is not valid JSON`, { cause: error });
  }
}
```

Two decisions left: how you turn a forward-slash relative path back into a
real path for reading (`relative.split("/")` spread into `path.join` is one
way, and it is the reason the walker normalised the separators in the first
place), and the comparator for the sort. `localeCompare` reads better than
`a < b ? -1 : 1` and behaves for non-ASCII ids.
