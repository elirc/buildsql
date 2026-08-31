## Hint 1

`MemoryStore<T>` is a `Dictionary<string, T>` with five one-line members. The
interesting parts are the *signatures*: two interfaces rather than one, and a
constraint that lets the store index items by their own `Id`.

`where T : class, IHasId` says two things - T is a reference type (so `T?` and
`null` mean what you expect) and T has an `Id`.

## Hint 2

```csharp
public T? Find(string id) => _items.TryGetValue(id, out T? item) ? item : null;
public void Save(T item) => _items[item.Id] = item;
public bool Delete(string id) => _items.Remove(id);
```

`Save` reading `item.Id` is only legal because of the constraint - without it
the compiler knows nothing about T and there is no `Id` to read. That is what
constraints are for: they buy you members.

`All` has to have a defined order, so sort explicitly:
`_items.Values.OrderBy(item => item.Id, StringComparer.Ordinal).ToList()`.

`Catalogue.Ids<T>` and `Describe<T>` repeat the constraint because a generic
method must state its own. Both take `IReadStore<T>` rather than
`MemoryStore<T>`: a reporting function has no business being able to delete
things, and a parameter type is the cheapest way to say so.
