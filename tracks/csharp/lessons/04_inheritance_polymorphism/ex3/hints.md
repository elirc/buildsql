## Hint 1

Each `Speak` needs a modifier in front of `string`, and the two modifiers are
different. The XML comment above each class says which behaviour is wanted; the
gate says what that behaviour looks like from the outside.

Build the project before you guess: the compiler already warns you about both
methods, and one of those warnings names the keyword it thinks you meant.

## Hint 2

`override` replaces the base implementation everywhere. Calls are dispatched on
the **runtime type** of the object, so a `Duck`-typed variable holding a
`LoudDuck` gets the loud version.

`new` declares a *different method that happens to share a name*. Calls are
resolved by the **compile-time type** of the variable, so a `Duck`-typed
variable holding a `SneakyDuck` gets `Duck`'s version, and only a
`SneakyDuck`-typed variable sees the hidden one.

The return values are `"QUACK"` and `"shh"`.

## Hint 3

```csharp
public class LoudDuck : Duck
{
    public /* which one? */ string Speak() => "QUACK";
}
```

If you are still unsure, work backwards from the gate. It asserts that a
`Duck`-typed variable holding a `SneakyDuck` says `"quack"` — the base word.
Only one of the two modifiers can produce that.

Then read the gate's last two assertions together: the same object, cast two
ways, giving one answer in one case and two in the other.
