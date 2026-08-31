## Hint 1

Both methods are one line. `Ring` is the same null-conditional raise as ex1.

`Silence` is the interesting one: think about what "remove every subscriber"
means for a delegate field, and about which code is allowed to say it.

## Hint 2

```csharp
public void Silence()
{
    Rung = null;
}
```

Assigning to an event is legal *only* inside the class that declares it -
outside, the event exposes nothing but `add` and `remove`. That is exactly why
`Silence` has to be a method on `Bell` rather than something a caller can do
for itself, and it is the clearest single reason to declare an event rather
than a public delegate field.

The rest of the gate is about `+=` and `-=` themselves, which you do not
implement: subscribing the same handler twice puts it on the list twice, and
`-=` takes off one copy. Predict those results before you run the test.
