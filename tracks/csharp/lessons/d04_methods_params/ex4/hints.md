## Hint 1

`ref` passes the *variable*, not the value: assignments inside the method land
on the caller's storage. `out` is the same mechanism with a different contract
(the method must assign it). A plain parameter is a copy, and nothing you do to
it is visible outside.

All three methods here are two or three lines. The exercise is knowing which
parameter kind does what.

## Hint 2

`(a, b) = (b, a);` swaps two variables using a tuple, with no temporary of your
own. It works on `ref` parameters exactly as it works on locals.

`BumpByValue` is deliberately written to modify its parameter before returning:

```csharp
count++;
return count;
```

That mutation is real - it just happens to a copy that dies when the method
returns. Watching the gate assert that the caller's variable is still 5 is the
point of the exercise.

Both `ref` and `out` also have to be written at the CALL site (`Scale(ref x,
ref y, 10)`), which is a deliberate design decision in C#: you cannot have your
variable reassigned by a method without seeing it in the code you wrote.
