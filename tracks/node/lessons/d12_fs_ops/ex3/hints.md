## Hint 1

The shape of the answer is the shape of the recursion: `dirStats` returns
`{ files, bytes }`, so the recursive call returns the same thing and the totals
simply add up. No accumulator parameter needed.

`readdir` with `withFileTypes: true`, then a branch on `isDirectory()` and
`isFile()`.

## Hint 2

`stat(file).size` is the byte count. Note the two things that are *not* counted:
directories themselves — they have a size on disk and it is not what anybody
means by "how big is this folder" — and anything that is neither a file nor a
directory, which is why the `else if` is `isFile()` rather than a bare `else`.

An empty directory returns zeros because the loop simply does not run, which is
the kind of edge case worth *noticing* is already handled rather than adding a
branch for.
