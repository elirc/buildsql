// i2_interview_drills / ex4 - a disposable resource wrapper. Time-box: 15 minutes.
// See lessons/i2_interview_drills/README.md, "Exercise 4".

namespace CSharpDojo.I2_InterviewDrills;

/// <summary>
/// Borrows a connection from a pool and returns it on Dispose. Using one after
/// it has been returned is a bug, and must say so.
/// </summary>
public sealed class PooledConnection : IDisposable
{
    private readonly Queue<IConnection> _pool;
    private readonly IConnection _connection;
    private bool _disposed;

    public PooledConnection(IConnection connection, Queue<IConnection> pool)
    {
        _connection = connection;
        _pool = pool;
    }

    /// <summary>
    /// The borrowed connection - or an ObjectDisposedException if this wrapper
    /// has already given it back.
    /// </summary>
    public IConnection Connection =>
        throw new NotImplementedException("ex4: Connection is not implemented yet - edit this file.");

    /// <summary>
    /// Return the connection to the pool, exactly once however many times this
    /// is called.
    /// </summary>
    public void Dispose()
    {
        throw new NotImplementedException("ex4: Dispose is not implemented yet - edit this file.");
    }
}
