## Hint 1

Three levels, and each one adds exactly one thing. Draw the expected string for
`UrgentEmailMessage` from the inside out before you write anything:

```
Message.Envelope        -> "email: hello"
EmailMessage.Envelope   -> "[Update] " + that
UrgentEmailMessage      -> "!! " + that + " !!"
```

`SmsMessage` overrides nothing but `Channel`, which proves the base version
works on its own.

## Hint 2

```csharp
public override string Envelope() => $"[{Subject}] " + base.Envelope();
public override string Envelope() => "!! " + base.Envelope() + " !!";
```

Note that `UrgentEmailMessage` does not override `Channel`. It does not need
to: `EmailMessage` already did, and an override is inherited exactly like any
other member. Restating it would be duplication that could drift.

The other thing to notice is that `Message.Envelope` reads `Channel`, which is
abstract - so the base class calls into a subclass member without knowing
anything about the subclass. Whenever you see a base method whose behaviour
changes for each derived type, that is what is happening.
