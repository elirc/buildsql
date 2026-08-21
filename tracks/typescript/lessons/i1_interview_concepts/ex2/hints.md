## Hint 1

Two things are wrong and only one of them is a missing branch. The `default:
return "unknown"` is what allowed the missing branch to go unnoticed - a
catch-all that silently swallows every future variant too.

Interviewers ask this as "how do you make sure a switch over a union stays
exhaustive?".

## Hint 2

Replace the catch-all with a call to a helper whose parameter type is `never`:

```ts
function assertNever(value: never): never {
  throw new Error(`unhandled: ${JSON.stringify(value)}`);
}
```

Inside the `default` of an exhaustive switch, the value has been narrowed to
`never`, so the call compiles. Miss a case and it does not - and the error names
the variant you forgot, which is how the compiler hands you a to-do list.

Add the missing `failed` branch; the README has its exact wording.

## Hint 3

Add the missing case and change the default:

```ts
    case "failed":
      return `failed: ${job.message}`;
    default:
      return assertNever(job);
```

Left to you: the `return` in front of `assertNever`. Try a bare call instead and
read what TypeScript says about the function's return type - the difference
between the two is worth understanding before you explain this pattern to
someone else.
