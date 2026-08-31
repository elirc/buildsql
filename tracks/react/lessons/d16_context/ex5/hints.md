## Hint 1

The provider has state of its own that has nothing to do with the account.
When that state changes the provider re-renders, and one line in its body runs
again — the line that builds the value. Ask whether the *result* of that line
is a new thing or the same thing described again.

## Hint 2

React compares context values with `Object.is`, so two structurally identical
objects are two different values. Keep the object identical until the thing it
describes actually changes, and say in the dependency array what "actually
changes" means here.
