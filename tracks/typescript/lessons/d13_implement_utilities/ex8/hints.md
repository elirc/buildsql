## Hint 1

`A & B` is the trap, not the answer: an intersection demands both sides at
once, so two different declarations of `retries` collapse into `never`. A merge
has to *choose*, and choosing is what conditional types do.

## Hint 2

Build the result as one mapped type whose key set covers both shapes:
`[K in keyof A | keyof B]`. For each key, decide where the value comes from.

## Hint 3

In the value position, check `K extends keyof B` first - that order is what
"B wins" means - and fall back to `A[K]` when only A has the key. Left to you:
the final arm of the conditional. It can never be reached (every `K` came from
one of the two), but the syntax demands you write something there - pick the
type that says "impossible".
