## Hint 1

A recursive walk carrying the **relative** path as it goes. `readdir(dir, {
withFileTypes: true })` gives you entries that know whether they are a directory,
which saves a `stat` per entry and is the difference between a walk that is fast
and one that is not.

Create the destination directory before recursing into it, and let `copyFile` do
the actual copying.

## Hint 2

Keep the relative path as a **forward-slash string** all the way through, and
build a real filesystem path from it only when you need one
(`path.join(root, ...relative.split("/"))`).

Doing it the other way round — carrying native paths and converting at the end —
means remembering to convert, and the day somebody forgets, the function returns
`nested\b.txt` on Windows and every test comparing paths breaks on one machine
out of three.

## Hint 3

`skip` is consulted on directories as well as files, and returning true prunes
the whole subtree: `continue` before you `mkdir` it, so the empty directory is
not even created.

That distinction — pruning versus filtering — is worth naming. A filter that
copies the directory and then skips its contents leaves `node_modules/` sitting
empty in the output, and somebody will file a bug about it.

Sorting once at the end is simpler than trying to walk in order, because
`readdir` makes no promises about the order it returns entries in.
