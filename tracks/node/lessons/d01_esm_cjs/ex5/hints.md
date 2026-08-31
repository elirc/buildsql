## Hint 1

Three readers, three mechanisms:

- `import { total } from "./tally"` gives you a *binding*, not a value. Reading
  `total` later re-reads the exporting module variable.
- `const { total } = require("./tally.cjs")` runs an ordinary property read at
  the moment the line executes, and stores the number in a local.
- `legacy.total` is a property read every time you write it.

Only one of the three can change under you, and only one of the three can go
stale.

## Hint 2

Structure the body as: take all three "before" readings, call both `add`
functions, then take all three "after" readings — except that one of the three
cannot be re-read at all, because the local you copied it into is the only
thing you have.

That last sentence is the answer to why `cjsCopy` looks the way it does in the
gate. Write it so it falls out of the mechanism rather than typing the number.
