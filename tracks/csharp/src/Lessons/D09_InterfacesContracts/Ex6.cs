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
        throw new NotImplementedException("ex6: Resource.Dispose is not implemented yet - edit this file.");
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
        throw new NotImplementedException("ex6: Scope.Add is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Dispose everything this scope owns, LAST added first, and only once
    /// however many times this is called.
    /// </summary>
    public void Dispose()
    {
        throw new NotImplementedException("ex6: Scope.Dispose is not implemented yet - edit this file.");
    }
}
