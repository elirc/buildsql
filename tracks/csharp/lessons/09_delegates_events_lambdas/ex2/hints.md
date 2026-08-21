## Hint 1

Three tiny methods, and two of them are deliberately the *same code* in two
loop shapes. Write them the obvious way. Do not try to be clever, and
specifically do not copy the loop variable into a local inside `FromForLoop` —
the gate is checking for the naive version, because the naive version is the
one that teaches you something.

## Hint 2

`MakeCounter` declares a local, returns a lambda that touches it, and the local
outlives the method:

```csharp
int count = 0;
return () => ++count;
```

`++count` increments and hands back the new value, which is why the first call
is 1 and not 0.

The two loop methods each build a `List<Func<int>>` and add `() => i` three
times — one with `for (int i = 0; i < 3; i++)`, one with
`foreach (int i in new[] { 0, 1, 2 })`.

## Hint 3

Before you run the gate, predict both lists out loud. Most people get one of
them wrong, and the reason is worth having in your own words:

A lambda captures the **variable**, not the value it had at the time. A `for`
loop declares its variable once for the whole loop; a `foreach` declares a
fresh one each iteration (it has done since C# 5, and the change was made
precisely because everybody got this wrong).

So one of your two methods hands back three functions sharing one variable, and
the other hands back three functions with one variable each. The gate's message
tells you which is which if your prediction was off — but predict first.
