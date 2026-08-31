## Hint 1

Two topics: template literal patterns (d17) and `infer` (d16). One conditional
type, two captures, and `never` for the false branch.

## Hint 2

A placeholder followed by a literal matches non-greedily, so
`` `${infer Scope}:${infer Name}` `` stops at the *first* colon and everything
after it lands in `Name` - which is exactly the runtime behaviour `indexOf`
gives you.

Left to you: the runtime needs one assertion on the returned object, because the
compiler cannot check that two `slice` calls produced the literal types the
conditional derived. Write the comment that says why it is safe.
