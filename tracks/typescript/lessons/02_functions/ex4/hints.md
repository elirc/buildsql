## Hint 1

The gate wants `duplicate("ab")` to be a `string` and `duplicate(2)` to be a
`number` - not `string | number` in both cases. A single signature cannot say
that, because a single signature has exactly one return type.

TypeScript's answer is to let you declare the same function more than once.
The README's Concept section shows the shape.

## Hint 2

Overloads are two or more signatures with no body, followed by one
implementation signature that has a body:

```ts
export function example(value: string): string;
export function example(value: boolean): boolean;
export function example(value: string | boolean): string | boolean {
  ...
}
```

The implementation signature is not visible to callers - only the overloads
above it are - so it can be as loose as it needs to be. Inside the body,
`typeof value === "string"` tells the compiler which branch it is in.

## Hint 3

Write two overload signatures - `(value: string): string` and
`(value: number): number` - then an implementation signature accepting
`string | number` and returning `string | number`. Branch on `typeof` inside,
concatenating for strings and multiplying by two for numbers.

Left to you: the order of the overloads. Swap them and everything still
compiles here, but the resolution rule is "first match wins", which matters a
great deal once two overloads can both accept the same argument.
