## Hint 1

A recursive walk with an accumulator. The inner function takes the directory
it is currently looking at; the outer function owns the results array and the
root that every result is relative to.

`readdir(dir, { withFileTypes: true })` is the call you want: it gives you
`Dirent` objects with `name`, `isDirectory()` and `isFile()`, so you do not
have to `stat` every entry separately.

## Hint 2

For each entry, build the full path with `path.join(current, entry.name)` and
then branch: recurse into directories, and for files check the extension with
`path.extname`.

The result has to be relative to the directory you were *originally* given -
not the one you are currently reading - which is why the root has to be
captured by the outer function and passed to `path.relative`.

Then the portability step: `path.relative` returns backslashes on Windows and
the gate expects forward slashes. `.split(path.sep).join("/")` converts one to
the other and does nothing on Linux.

## Hint 3

```ts
const found: string[] = [];

const walk = async (current: string): Promise<void> => {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/* is it .json? */) found.push(/* relative, forward slashes */);
  }
};

await walk(dir);
return /* ? */;
```

Two decisions left: the extension test, and the fact that the gate wants the
list sorted - `readdir` order is filesystem order, which is alphabetical on
some systems and not on others, so sort it yourself rather than hoping.
