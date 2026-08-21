## Hint 1

`require` does not exist in an ES module. That is not a bug in your setup and
no `tsconfig` flag fixes it: ESM has no synchronous loader, so the function
simply is not in scope.

Node's answer is a factory. You ask it for a `require` bound to a particular
module location and you get back the real thing, cache and all. The README
names the function; it lives in `node:module`.

## Hint 2

```ts
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
```

Now `require("./legacy-pricing.cjs")` resolves relative to *this* file and
returns whatever the CommonJS module assigned to `module.exports` - here an
object with two properties. Do the require once, at module scope, rather than
on every call.

`regions()` wants the keys of `RATES`, sorted, not a list you type out by hand.

## Hint 3

Structure:

```ts
const require = createRequire(import.meta.url);
const legacy = require("./legacy-pricing.cjs");

export function checkout(cents: number, region: string): number {
  return legacy./* which exported function? */(cents, region);
}
```

Two decisions left: which of the two exports each function needs, and how to
get a sorted array of keys out of an object (`Object.keys` gives you the
array; sorting it is one method call away). TypeScript types the require
result as `any`, so nothing will warn you about a misspelled property - the
names are in the comment at the top of your stub.
