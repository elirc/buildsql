## Hint 1

`ToString` is declared `virtual` on `object`, so overriding it means every
piece of framework code that formats your object - string interpolation,
`string.Join`, `Console.WriteLine`, a debugger watch window - gets your version
for free.

`Cell` declares it `abstract override`, which is a way of saying "object's
default is not good enough for anything here, so every subclass must decide".

## Hint 2

Each override is one expression. `NumberCell` needs the same
`ToString("0.00", CultureInfo.InvariantCulture)` you used in d02 ex2.

`Render` is the shortest method in this drill:

```csharp
public static string Render(IEnumerable<Cell> cells) => string.Join(" | ", cells);
```

`string.Join` has an overload taking `IEnumerable<T>` and calls `ToString` on
each element. There is no cast, no `Select(c => c.ToString())`, and no type
test - and the object-typed assertion in the gate is there to show that the
dispatch is real virtual dispatch rather than anything the compiler worked out
from the static type.
