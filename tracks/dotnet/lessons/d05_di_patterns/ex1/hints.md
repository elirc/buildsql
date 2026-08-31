## Hint 1

Registering the same interface more than once does not replace anything — it
builds a set, and `IEnumerable<INotifier>` is how you get the whole set. The
stub only registers one of the three.

Then the handler is a lookup: which member of the set has this channel?

## Hint 2

Three `AddSingleton<INotifier, …>()` calls, one per implementation.

In the handler, materialise the enumerable once (`notifiers.ToList()`) because
you need it twice: `FirstOrDefault(n => n.Channel == channel)` to pick, and
`Select(n => n.Channel)` to list.

`FirstOrDefault` plus a null check gives you the 404; `First` would throw and
turn a client mistake into a 500.
