## Hint 1

Three topics: `unknown` at a boundary (d19), discriminated unions (d07) and
narrowing (d06). The order is always container, then discriminant, then payload.

## Hint 2

`typeof null` is `"object"` and so is `typeof []`, so both need ruling out
before anything is read off the input. After that, one cast to
`Record<string, unknown>` makes the field reads legal.

## Hint 3

Rebuild the returned object rather than returning the input. It costs one
literal per branch and means an input carrying forty extra fields does not smuggle
them into the rest of the program.

Left to you: whether an unknown `type` deserves a thrown error rather than
`null`. The prompt says `null`; a parser at a trust boundary and a parser over
your own messages want different answers.
