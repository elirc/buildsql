## Hint 1

Three different intents, three different calls: `TryDequeue` removes (and
tells you whether it could), `Enqueue` re-adds at the back, and plain
enumeration - `queue.Take(count)` - looks without touching. `UpNext` must
leave `queue.Count` unchanged; the gate checks.

## Hint 2

`Postpone` is `TryDequeue` then `Enqueue`:

```csharp
if (!queue.TryDequeue(out string? ticket)) { return null; }
queue.Enqueue(ticket);
return ticket;
```

`TakeNext` is the first half alone; `UpNext` is `queue.Take(count).ToList()`.
