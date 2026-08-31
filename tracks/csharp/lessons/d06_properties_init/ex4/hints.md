## Hint 1

A property with a body is the place to put a rule that must hold however the
value arrives. Here the rule is "the stored level is always between 0 and 100",
and the decision is *clamp* rather than *throw* - a volume knob that raised an
exception would be a strange knob.

`Muted` is separate state, and `Effective` is derived from both.

## Hint 2

`Math.Clamp(value, 0, 100)` is the whole setter body, plus one more line:

```csharp
set
{
    _level = Math.Clamp(value, 0, 100);
    Muted = false;
}
```

That second line is the interesting design decision. Setting a level while
muted unmutes, because reaching for the volume control means you want to hear
something - and encoding that in the setter means no caller has to remember it.

`Effective => Muted ? 0 : _level;` keeps the two ideas separate: what you asked
for, and what you get. A design that zeroed `_level` on mute would have to
remember the old value somewhere anyway, and would answer the question "what
was the volume before you muted?" with a shrug.
