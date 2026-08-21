## Hint 1

The two method bodies are `return producer;` and `return consumer;`. That is
not a joke — the exercise is making those two lines *compile*, which they do
not until each interface's type parameter carries a variance annotation.

Try writing them first and read the two compiler errors. They are unusually
clear about what is missing.

## Hint 2

`out T` means "T only ever comes out of this interface" and permits
`IProducer<string>` to be used as `IProducer<object>`. That is safe because
every string that comes out is an object.

`in T` means "T only ever goes into this interface" and permits
`IConsumer<object>` to be used as `IConsumer<string>`. That is safe because a
consumer that accepts anything certainly accepts strings.

The annotation goes on the interface declaration:
`public interface IProducer<out T>`.

## Hint 3

The reason the compiler insists on the annotation rather than working it out
itself is safety in the *other* direction. If `IProducer<out T>` had a method
taking a `T`, you could hand an `IProducer<object>` where an
`IProducer<string>` was expected and then feed it an `int` — so C# checks that
`T` appears only in return positions before it lets you write `out`.

That is the same reason arrays are a known hole in the type system: C# allows
`object[] a = new string[1];` and then throws `ArrayTypeMismatchException` at
runtime when you store the wrong thing. Generic variance was designed to not
repeat that mistake, which is worth saying out loud in an interview.

Left to you: whether to write the bodies as expression-bodied members. Both
forms are one line.
