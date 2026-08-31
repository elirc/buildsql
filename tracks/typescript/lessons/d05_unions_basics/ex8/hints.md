## Hint 1

`ColumnKind` is five literal strings joined by `|`. Writing it as `string` means
a typo in your own code compiles - which is exactly what the type gate objects
to.

Then: the number of columns is the length of the *longest* row, not of the
first one, and not of any row when there are no rows at all.

## Hint 2

Each column is a tiny fold with three states. Start at `"empty"`. The first
non-null cell sets the kind. Any later cell of a different kind latches it to
`"mixed"`, and nothing can move it back.

Treat a cell that is past the end of a short row exactly like a `null`, so
ragged input needs no separate branch.

Left to you: collect each column into an array first and classify it, or fold as
you walk. The fold allocates nothing; the collect version is easier to test in
pieces.
