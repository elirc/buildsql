## Hint 1

Call all three loaders first, then wait. `await loadUser()` on its own line
means the second loader has not even been called yet.

## Hint 2

`Promise.all` over an array literal of three differently typed promises gives a
promise of a **tuple**, so destructuring the result keeps each type. That
inference is the reason the assembled object needs no annotations inside.

Left to you: destructure the tuple or index it. The tuple types are the same
either way; one of them survives someone adding a fourth loader in the middle.
