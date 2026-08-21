## Hint 1

Same two ideas as ex1 and ex4: an interface with one optional member, and a
fallback when that member is missing. The name shown to the learner is the
nickname when there is one, and the real name otherwise.

The streak has two renderings, and zero is the interesting one.

## Hint 2

`learner.nickname ?? learner.name` is the fallback. Note that it is `??` and
not `||` for a reason that bites here: a nickname of `""` is falsy, and `||`
would quietly discard it. Whether an empty nickname *should* be discarded is a
design question - but it should be one you decided, not one the operator
decided for you.

## Hint 3

Add `streak: number` and `nickname?: string` to the interface. Compute the
displayed name with `??`, then branch on `streak === 0` between
`` `${shown} - no streak yet` `` and `` `${shown} - ${streak} day streak` ``.

Left to you: whether a streak of 1 should read "1 day streak" or "1 day
streak" pluralised properly. The gate only checks the values it checks - and
lesson 00 already made you think about this once.
