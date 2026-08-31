## Hint 1

There is a function in `node:path` that answers exactly the question "how do I
get from A to B" — you are not meant to compare the two strings yourself.

## Hint 2

That function answers in the **platform** separator, and this one has to answer
in the URL separator. Split on `path.sep` and join with `/` rather than
replacing characters — a `replaceAll("\\", "/")` is a no-op on Linux, so the bug
it hides never shows up until somebody on Windows runs the build.

One case comes back as the empty string. Decide what that should be before you
look at the gate.
