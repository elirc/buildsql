## Hint 1

The recursion has to answer a question, not just do work: **is this directory
empty once I have finished with its children?** Have the helper return a boolean
and the whole thing falls out.

For each entry: a file means "not empty, and nothing to do". A directory means
"recurse, and if the answer is yes, remove it and record it — otherwise I am not
empty either".

## Hint 2

The order is the entire exercise. `outer/` contains `inner/`, so at the moment
you first look at `outer` it is *not* empty — it only becomes empty after
`inner` is removed. A top-down walk therefore sees a non-empty directory and
moves on, and one pass is not enough.

Recursing before deciding is what makes a single pass correct.

## Hint 3

Use `rmdir`, not `rm(dir, { recursive: true })`. `rmdir` refuses to delete a
directory that is not empty, which turns your "I believe this is empty" into a
check the operating system performs for you — and this is a function that
deletes things, so a second opinion is worth having.

Two details: the root is visited but never removed, which falls out of removing
directories from the *parent's* loop rather than at the top of `visit`. And the
returned paths are relative with forward slashes, for the same reason as ex2.
