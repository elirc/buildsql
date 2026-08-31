## Hint 1

A construct signature is a member with no name whose keyword is `new`:

```ts
export interface ClockConstructor {
  new (startedAt: number): Clock;
}
```

That is the type of the *class*. `Clock` is the type of what the class produces,
and a parameter typed `Clock` would refuse `StepClock` itself.

## Hint 2

Inside the function, `new ctor(startedAt)` gives you a `Clock`. Seed the result
with `startedAt` so that zero (or a negative) tick count returns it unchanged
without a special branch.

Left to you: a `for` loop or a `while`. Neither is interesting - what is
interesting is that you can explain why `typeof StepClock` would have been the
wrong parameter type.
