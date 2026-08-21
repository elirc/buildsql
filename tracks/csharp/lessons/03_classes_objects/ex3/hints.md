## Hint 1

There are exactly two pieces of state here and they live in different places.
`Built` belongs to the *type* — one of it, no matter how many robots exist.
`Serial` belongs to each *object* — one per robot, fixed for life.

The constructor is where the two meet: it changes the shared one and reads the
result into the private one.

## Hint 2

Order matters. The first robot must get serial 1, not 0, so increment the
shared counter *before* you read it into `Serial`.

`Serial` is declared `{ get; }` with no setter, which means only the
constructor may assign it — that is the compiler enforcing "fixed for life".

`Reset` is `static`, so it has no `this` and cannot touch any robot's `Serial`.
That is not a limitation to work around; it is the correct behaviour, and the
gate checks it.

## Hint 3

```csharp
public Robot()
{
    Built++;
    // now Serial gets the number you just produced
}
```

`Built` has a `private set`, so the increment compiles inside the class and
`Robot.Built = 0;` from a test would not. `Reset` is one assignment.

Worth pausing on before you move to ex4: this shared counter is not
thread-safe. Two threads calling `new Robot()` at the same moment can both read the
same value. `Interlocked.Increment` is the fix, and lesson 13 is where that
conversation belongs.
