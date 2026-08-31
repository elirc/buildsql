## Hint 1

`required` moves "you must set this" from a runtime exception to a compile
error: `new MailMessage { }` will not build, and the compiler names the
properties you left out.

The two properties are already declared for you. Your job is the two computed
members underneath.

## Hint 2

`HasBody` is `Body.Length > 0` - and it needs no null check, because `Body` has
an initialiser (`= ""`) and the only way to change it is `init`, which cannot
store a null into a non-nullable `string` without a warning.

`Summary` is one interpolated string reading all three:

```csharp
$"To: {To} | {Subject} ({Body.Length} chars)"
```

Worth knowing for the follow-up question: `required` is enforced by the
compiler, not the runtime, so it protects C# callers and does nothing about
reflection or a deserialiser that builds the object another way. It is a very
good default and it is not a validation framework.
