## Hint 1
Two buttons that differ only by a sign, and a rule that the value may never
leave `[min, max]`. Write one function that takes the step and does the work;
the buttons just call it with `1` and `-1`.

## Hint 2
The clamp has to see the value it is about to write, which means it belongs
*inside* the updater rather than outside it:

```tsx
setTemperature((previous) => /* clamp(previous + by) */);
```

`Math.min` and `Math.max` compose into a clamp: the smaller of `max` and (the
larger of `min` and the candidate).

## Hint 3
Clamping outside the updater — computing the next value from `temperature` and
then calling the setter — happens to work when clicks arrive one at a time, and
stops working the moment two updates land in the same batch. The remaining
decision is whether to also disable a button at the end of the range; the gate
does not require it, but ask yourself what a user learns from a button that
does nothing.
