## Hint 1

`Stutter` is one `foreach` containing TWO `yield return item;` statements in
a row. Do not collect into a list - the gate counts how many items were read
from the source, and a list reads all of them immediately.

## Hint 2

`Numbered` keeps a counter local:

```csharp
int number = 1;
foreach (string item in items)
{
    yield return $"{number}. {item}";
    number++;
}
```

Iterator locals live inside the compiled state machine, so `number` keeps
its value between pulls - that is why this just works.
