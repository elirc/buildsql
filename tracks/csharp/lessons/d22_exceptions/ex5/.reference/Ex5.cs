// d22_exceptions / ex5 - cleanup that happens anyway.
// See lessons/d22_exceptions/README.md, "Exercise 5".

namespace CSharpDojo.D22_Exceptions;

// The gate builds these. Written for you.
public sealed class Probe : IDisposable
{
    private readonly List<string> _log;

    public Probe(string name, List<string> log)
    {
        Name = name;
        _log = log;
        _log.Add($"open:{name}");
    }

    public string Name { get; }

    public bool Disposed { get; private set; }

    public void Dispose()
    {
        if (Disposed)
        {
            return;
        }

        Disposed = true;
        _log.Add($"dispose:{Name}");
    }
}

public static class Resources
{
    /// <summary>
    /// Opens a Probe with that name, runs the body on it, and disposes it
    /// whatever happens. Returns "ok", or "failed:&lt;message&gt;" when the
    /// body threw - and the probe is disposed before either value is returned.
    /// </summary>
    public static string Use(string name, List<string> log, Action<Probe> body)
    {
        using (Probe probe = new Probe(name, log))
        {
            try
            {
                body(probe);
                return "ok";
            }
            catch (Exception ex)
            {
                return $"failed:{ex.Message}";
            }
        }
    }

    /// <summary>
    /// Opens "outer" and then "inner", runs the body, and disposes both -
    /// inner first, because it was opened last. Any exception from the body
    /// escapes, after the disposals.
    /// </summary>
    public static void UseTwo(List<string> log, Action body)
    {
        using (new Probe("outer", log))
        using (new Probe("inner", log))
        {
            body();
        }
    }
}
