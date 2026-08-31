// d09_interfaces_contracts / ex6 - IDisposable, and a scope that owns others.
// See lessons/d09_interfaces_contracts/README.md, "Exercise 6".

namespace CSharpDojo.D09_InterfacesContracts;

public class Resource : IDisposable
{
    private readonly List<string> _log;

    public Resource(string name, List<string> log)
    {
        Name = name;
        _log = log;
    }

    public string Name { get; }

    public bool Disposed { get; private set; }

    /// <summary>
    /// Appends "dispose NAME" to the log - EXACTLY once, however many times
    /// this is called - and sets Disposed.
    /// </summary>
    public void Dispose()
    {
        if (Disposed)
        {
            return;
        }

        Disposed = true;
        _log.Add($"dispose {Name}");
    }
}

public class Scope : IDisposable
{
    private readonly List<IDisposable> _children = new List<IDisposable>();

    public bool Disposed { get; private set; }

    /// <summary>
    /// Take ownership of a disposable. Adding to a disposed scope is an
    /// ObjectDisposedException.
    /// </summary>
    public void Add(IDisposable child)
    {
        ObjectDisposedException.ThrowIf(Disposed, this);
        _children.Add(child);
    }

    /// <summary>
    /// Dispose everything this scope owns, LAST added first, and only once
    /// however many times this is called.
    /// </summary>
    public void Dispose()
    {
        if (Disposed)
        {
            return;
        }

        Disposed = true;
        for (int i = _children.Count - 1; i >= 0; i--)
        {
            _children[i].Dispose();
        }
    }
}
