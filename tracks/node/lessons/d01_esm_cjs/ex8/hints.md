## Hint 1

Four cases, and getting them in the right order is most of the work:

1. the whole field is a string — only `.` resolves;
2. an exact key exists — use it, even if its value is `null`;
3. some pattern keys match — pick one and substitute;
4. nothing matches — `null`.

Case 2 before case 3 is what makes `./features/legacy` beat `./features/*`.

## Hint 2

A pattern is a key containing one `*`. Split it there into a prefix and a
suffix; it matches when the subpath starts with the prefix, ends with the
suffix, and is long enough to have both without them overlapping. Whatever sits
between them is the captured text, and it goes into the `*` in the target.

Note that `*` is not a glob: it matches slashes happily, which is why
`./features/deep/nested` resolves.

## Hint 3

For the tie-break, keep a running best while you loop and only replace it when
the new pattern has a strictly longer prefix. Two decisions are left to you: at
what point you check for a `null` target (before or after choosing the winner
changes the answer for `./internal/secret`), and how you substitute — `*` may
appear only once in a target, so the simplest string replacement is enough.
