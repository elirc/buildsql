// d09_interfaces_contracts / ex7 - split the contract, constrain the parameter.
// See lessons/d09_interfaces_contracts/README.md, "Exercise 7".

namespace CSharpDojo.D09_InterfacesContracts;

public interface IHasId
{
    string Id { get; }
}

public interface IReadStore<T>
    where T : class, IHasId
{
    T? Find(string id);

    int Count { get; }

    IReadOnlyList<T> All { get; }
}

public interface IWriteStore<T>
    where T : class, IHasId
{
    void Save(T item);

    bool Delete(string id);
}

public class Note : IHasId
{
    public Note(string id, string text)
    {
        Id = id;
        Text = text;
    }

    public string Id { get; }

    public string Text { get; }
}

/// <summary>One class, both halves of the contract.</summary>
public class MemoryStore<T> : IReadStore<T>, IWriteStore<T>
    where T : class, IHasId
{
    private readonly Dictionary<string, T> _items = new Dictionary<string, T>();

    /// <summary>The item with that id, or null.</summary>
    public T? Find(string id)
    {
        throw new NotImplementedException("ex7: Find is not implemented yet - edit this file.");
    }

    public int Count => throw new NotImplementedException("ex7: Count is not implemented yet - edit this file.");

    /// <summary>Everything, ordered by Id ordinally.</summary>
    public IReadOnlyList<T> All =>
        throw new NotImplementedException("ex7: All is not implemented yet - edit this file.");

    /// <summary>Store it under its own Id, replacing anything already there.</summary>
    public void Save(T item)
    {
        throw new NotImplementedException("ex7: Save is not implemented yet - edit this file.");
    }

    /// <summary>Remove it. False when there was nothing to remove.</summary>
    public bool Delete(string id)
    {
        throw new NotImplementedException("ex7: Delete is not implemented yet - edit this file.");
    }
}

public static class Catalogue
{
    /// <summary>
    /// Every id in the store, joined with ",". The constraint is what lets this
    /// method read .Id from a T it knows nothing else about.
    /// </summary>
    public static string Ids<T>(IReadStore<T> store)
        where T : class, IHasId
    {
        throw new NotImplementedException("ex7: Ids is not implemented yet - edit this file.");
    }

    /// <summary>"3 item(s)". Takes only the reading half.</summary>
    public static string Describe<T>(IReadStore<T> store)
        where T : class, IHasId
    {
        throw new NotImplementedException("ex7: Describe is not implemented yet - edit this file.");
    }
}
