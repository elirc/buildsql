// d23_async_tasks / ex8 - one piece of work, however many askers.
// See lessons/d23_async_tasks/README.md, "Exercise 8".

namespace CSharpDojo.D23_AsyncTasks;

/// <summary>
/// Runs a factory at most once and hands every caller the SAME task, so ten
/// callers who all arrive before it finishes cause one piece of work rather
/// than ten. A factory whose task fails is not cached: the next caller tries
/// again.
/// </summary>
public sealed class AsyncOnce<T>
{
    private readonly Func<Task<T>> _factory;
    private Task<T>? _task;

    public AsyncOnce(Func<Task<T>> factory)
    {
        _factory = factory;
    }

    /// <summary>How many times the factory has been called.</summary>
    public int FactoryCalls { get; private set; }

    /// <summary>
    /// The shared task. The first caller starts the work; everybody who asks
    /// while it is still running gets the very same Task object back.
    /// </summary>
    public Task<T> GetAsync()
    {
        if (_task is not null && _task.IsFaulted)
        {
            _task = null;
        }

        if (_task is null)
        {
            FactoryCalls++;
            _task = _factory();
        }

        return _task;
    }
}
