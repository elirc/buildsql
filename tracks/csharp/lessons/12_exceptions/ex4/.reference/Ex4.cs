// 12_exceptions / ex4 - IDisposable and using: cleanup that happens anyway.
// See lessons/12_exceptions/README.md, "Exercise 4".

namespace CSharpDojo.L12_Exceptions;

/// <summary>
/// Stands in for a file handle or a connection. It writes to a log so the gate
/// can see exactly when it was opened, used and released.
/// </summary>
public class Resource : IDisposable
{
    private readonly List<string> _log;
    private bool _disposed;

    public Resource(List<string> log)
    {
        _log = log;
        _log.Add("open");
    }

    public void Use()
    {
        _log.Add("use");
    }

    /// <summary>
    /// Add "dispose" to the log - but only the FIRST time. Disposing twice is
    /// allowed and must be harmless.
    /// </summary>
    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;
        _log.Add("dispose");
    }
}

public static class Session
{
    /// <summary>
    /// Open a Resource in a using, Use() it, and throw an
    /// InvalidOperationException when <paramref name="shouldThrow"/> is set -
    /// otherwise add "finished". Catch that exception outside the using and
    /// add "caught". Return the log.
    /// </summary>
    public static List<string> Run(bool shouldThrow)
    {
        List<string> log = new List<string>();
        try
        {
            using Resource resource = new Resource(log);
            resource.Use();
            if (shouldThrow)
            {
                throw new InvalidOperationException("boom");
            }

            log.Add("finished");
        }
        catch (InvalidOperationException)
        {
            log.Add("caught");
        }

        return log;
    }
}
