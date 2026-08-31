## Hint 1

First fix the type. A middleware needs two parameters: the value, and `next` -
a function from a value to a value that represents *everything after this
middleware*. That second parameter is what lets it act after the rest has run.

## Hint 2

Build the chain lazily with a helper indexed by position:

```ts
const dispatch = (index: number) => (value: string): string => { ... };
```

At `index`, look up `middleware[index]`. If there is none, the chain is over -
return the value unchanged. Otherwise call it with the value and
`dispatch(index + 1)`.

Left to you: this recursive `dispatch`, or a right-to-left `reduceRight` that
folds the array into a single function. They produce the same onion; one of
them explains itself better in an interview.
