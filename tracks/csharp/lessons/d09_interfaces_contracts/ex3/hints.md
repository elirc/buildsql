## Hint 1

A class may implement as many interfaces as it likes - `MemoryDoc` implements
both, so it can be passed to a method wanting either.

The design point is in the *parameters*: `LengthOf` takes `IReadableDoc`
because reading is all it does, and that is what lets a `FrozenDoc` be passed
to it.

## Hint 2

Each method is one expression. `MemoryDoc.Write` appends: `_text += text;`.

`CanWrite` is the interesting one:

```csharp
public static bool CanWrite(IReadableDoc doc) => doc is IWritableDoc;
```

`is` asks about the object's runtime type, so a `MemoryDoc` narrowed to
`IReadableDoc` still answers true. Testing the *variable's* type would be
meaningless - it is `IReadableDoc` by definition.

The general rule this is drilling: **ask for the narrowest interface that does
the job**. A method taking `IReadableDoc` can be called with anything readable,
including types written after it; a method taking `MemoryDoc` can only be
called with a `MemoryDoc`, and cannot be tested with a fake.
