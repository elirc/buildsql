## Hint 1

The interview version of this question is "what is the difference between `any`
and `unknown`, and which would you use here?". The answer you want to be able to
demonstrate is that `unknown` forces the body to check before it acts - and that
the checking is the useful part, not a tax.

Change the parameter type first, then let the errors tell you what to check.

## Hint 2

Three groups of values, in this order: things with a `length` (strings and
arrays), other non-null objects (count their keys), and everything else (zero).

`Array.isArray(value)` narrows an `unknown` to `any[]`, and `typeof value ===
"string"` narrows it to `string`. Both branches give you a `.length`, so they
can share one `if`.

`Object.keys` needs a non-null object, and `typeof null === "object"`, so that
check has two halves.

## Hint 3

Parameter type `unknown`. First branch: `typeof value === "string" ||
Array.isArray(value)` returns `value.length`. Second: `typeof value ===
"object" && value !== null` returns `Object.keys(value).length`. Otherwise `0`.

Left to you: what `lengthOf(new Map([["a", 1]]))` should give. This version says
zero, because a `Map`'s entries are not its keys - and being able to say that
out loud is the difference between knowing the rule and having thought about it.
