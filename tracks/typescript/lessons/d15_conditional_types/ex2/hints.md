## Hint 1

Distribution happens when the checked type is a *naked type parameter* in a
conditional type. No conditional, no distribution - which is why the stub
returns one array.

## Hint 2

You need a conditional whose condition is always true, purely so the
distribution machinery runs: `T extends <something everything extends> ? T[] : never`.

Left to you: which "everything" to use in the condition. `unknown` and `any`
both hold for every member; one of them reads like a decision and the other
like a shrug.
