## Hint 1

The code is genuinely five lines per method - log, yield, log, yield, log
for `Steps`; a loop that logs then yields for `Squares`. The exercise is the
TIMING: each `MoveNext` runs the body from where it paused to the next
`yield return`. Write the obvious code, then predict every gate assertion
before running.

## Hint 2

```csharp
log.Add("start");
yield return 1;
log.Add("middle");
yield return 2;
log.Add("end");
```

"start" appears on the FIRST MoveNext (not at the call); "end" appears on
the LAST MoveNext - the one that returns false.

## Hint 3

For the abandoned-loop check: `foreach ... break` after one item means the
state machine is disposed while paused at the first yield - the code after
that yield never executes, so the log holds only "start". In `Squares`, put
the `log.Add($"computing {n}")` immediately BEFORE its `yield return n * n`
- logging up front or after would shift the counts the gate expects. Which
loop form you use is up to you.
