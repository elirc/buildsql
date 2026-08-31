## Hint 1

Staying silent will not work here, and the gate proves it: the charge nurse's
handler has already succeeded on this requirement, and a requirement is met as
soon as any handler succeeds. Silence is not a refusal.

## Hint 2

`context.Fail()` is the veto. In `ShiftLockHandler`:

    if (resource.Locked) context.Fail();

That is all. Nothing else in the file changes - the endpoint and the owner
handler are given and correct.

## Hint 3

A failure beats every success, from any handler, whatever order they ran in.
That is what makes `Fail` right for a rule that must hold for everybody - a
locked record, a suspended account - and wrong for "I have nothing to say about
this caller", which is what ex3 and ex4 do by returning without succeeding.
