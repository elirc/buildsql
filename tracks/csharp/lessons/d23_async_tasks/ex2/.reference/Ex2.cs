// d23_async_tasks / ex2 - what runs at the call, and what waits.
// See lessons/d23_async_tasks/README.md, "Exercise 2".

namespace CSharpDojo.D23_AsyncTasks;

public static class Timing
{
    /// <summary>
    /// Adds "before" to the log, waits for the gate task, adds "after", and
    /// returns the log joined with "|". Everything up to the first await runs
    /// while the caller is still waiting for the method to return.
    /// </summary>
    public static async Task<string> TraceAsync(Task gate, List<string> log)
    {
        log.Add("before");
        await gate;
        log.Add("after");
        return string.Join("|", log);
    }

    /// <summary>
    /// Greets the name once the ready task completes. An empty or null name is
    /// an ArgumentException thrown AT THE CALL - the caller must not have to
    /// await a task to find out they passed nonsense.
    /// </summary>
    public static Task<string> GreetAsync(string name, Task ready)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("name is required", nameof(name));
        }

        return Greet();

        async Task<string> Greet()
        {
            await ready;
            return $"hello {name}";
        }
    }
}
