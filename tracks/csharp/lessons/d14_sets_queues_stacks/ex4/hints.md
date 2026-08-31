## Hint 1

Keep a `Stack<string>` of snapshots. The one decision that matters: `Type`
pushes the text AS IT WAS, before appending. If you push after, Undo
"restores" the state you are already looking at - the gate's first Undo
assertion is written to catch exactly that.

## Hint 2

```csharp
public void Type(string addition)
{
    _history.Push(Text);
    Text += addition;
}
```

`Undo` checks `_history.Count` first - return false on empty rather than
letting `Pop` throw - and `CanUndo` is that same count as a bool.
