## Hint 1

Four literals: `"idle"`, `"loading"`, `"done"`, `"failed"`. Note that
`retriable` is *not* a discriminant - it is data inside one variant, and it
chooses wording rather than shape.

## Hint 2

A `switch` with four returns. The only nested decision is the retry wording, and
a ternary inside the template literal keeps it to one line:

```ts
`failed: ${load.error} (${load.retriable ? "retry" : "give up"})`
```

Left to you: whether to add an exhaustiveness check in a `default`. With four
variants and a fifth arriving one day, it is close to free insurance.
