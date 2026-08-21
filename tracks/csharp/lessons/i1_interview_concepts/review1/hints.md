## Hint 1

Three short bodies testing three facts that get asked constantly: what a
reference parameter can and cannot do, that strings are immutable, and how to
ask whether two references are the same object.

Write `AddThenReassign` exactly as described — including the part that has no
visible effect. That part is the lesson.

## Hint 2

```csharp
items.Add(99);          // the caller sees this
items = new List<int>(); // this only repoints the local parameter
items.Add(1000);        // ...so this goes into a list nobody else has
```

`Shout` is `text.ToUpperInvariant()` — returned, not assigned to `text`,
because assigning to `text` would be the same no-op as above.

`SameInstance` is `ReferenceEquals(a, b)`.

## Hint 3

The sentence to be able to say in an interview: **C# passes reference-type
arguments by value — the value being the reference.** So the method can mutate
the object it points at, and cannot repoint the caller's variable. Adding `ref`
to the parameter would change that, and is the follow-up question.

For strings, the reason `Shout` cannot change the caller's text is stronger
than the parameter rule: there is no operation anywhere in .NET that mutates an
existing string. `ToUpper`, `Trim`, `Replace` and `+=` all produce new ones.

Left to you: predict what `SameInstance("hello", "hello")` returns with two
literals rather than a literal and a built string. (Interning. It is worth
knowing the word.)
