## Hint 1

The pattern has three parts: a capture, the delimiter, and another capture.
Matching it tells you the string contains at least one delimiter.

## Hint 2

The true branch is a tuple that starts with the first capture and spreads the
recursive call on the rest: `[Head, ...Split<Tail, D>]`. The false branch is
the stub you were given, which is exactly right as a base case.

Left to you: check `Split<"a,,b", ",">` by hand and satisfy yourself that the
empty middle part survives. A placeholder that matches nothing is why it does.
