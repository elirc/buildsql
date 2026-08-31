## Hint 1

`try`/`catch` with `return await` inside the try (same reason as ex5), and a
catch that asks one question: does the predicate accept this?

Yes means return the fallback. No means rethrow — and the rethrow is where the
exercise lives.

## Hint 2

Two different objects are in play in the catch block, and mixing them up is the
whole trap.

The predicate is promised a real `Error`, so normalise before calling it. But
what you rethrow is the **original thrown value**, unchanged: the gate throws a
bare string and checks that exactly that string comes back out, and in the
`EACCES` case it checks the rethrown object is identical to the one thrown.

## Hint 3

The pattern itself is worth naming: a catch block that returns a fallback for
*everything* is how a permissions failure, a corrupt file and a disk full get
reported as "config file not found". Narrow the catch to the case you actually
expected, and let the rest through.

The remaining decision is what happens when the predicate itself throws. Nothing
in the specification says; whatever your code does, it should be on purpose.
