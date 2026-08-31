## Hint 1

`to_char` formats numbers as well as timestamps; the pattern describes the
digits you want, and `.00` fixes the decimals at two.

## Hint 2

A `9` pattern right-aligns and leaves room for a sign, so the raw output
starts with spaces. Prefix the pattern with `FM` to suppress the padding, or
wrap the whole call in `trim()`.
