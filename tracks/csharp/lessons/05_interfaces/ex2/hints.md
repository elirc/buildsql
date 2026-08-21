## Hint 1

The class as shipped compiles: one public `Greet()` satisfies both interfaces at
once, because C# matches interface members by signature. That is exactly the
problem — one method, one answer, two contracts that want different ones.

You need to delete that method and write two, each one nailed to a specific
interface.

## Hint 2

An *explicit* implementation names the interface in the member declaration and
takes no access modifier at all:

```csharp
string IEnglish.Greet() => "hello";
```

No `public`. There cannot be one, because the member is not part of the class's
own surface — it exists only through that interface. Write the French one the
same way.

## Hint 3

After both are written, try adding `person.Greet()` (with `person` typed as
`Bilingual`) somewhere and read the compiler error. That inaccessibility is the
feature: the only way to reach either greeting is to say which contract you are
asking under, by casting to `IEnglish` or `IFrench` — which is what the gate
does.

The decision left to you: whether either greeting should *also* be available
directly on the class. It can be, by implementing one implicitly and the other
explicitly. Try it and see which reads better.
