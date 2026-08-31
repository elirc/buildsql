// d24_mixed_gauntlet / ex7 - many tasks, some of them broken.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 7".

namespace CSharpDojo.D24_MixedGauntlet;

// The gate reads these. Written for you.
public record Outcome(List<string> Successes, List<string> Failures);

public static class Fetching
{
    /// <summary>
    /// Waits for every task and sorts them into what worked and what did not.
    /// Successes holds the results, Failures holds the exception messages,
    /// both in TASK order. One failure must not stop the others being
    /// reported.
    /// </summary>
    public static async Task<Outcome> GatherAsync(IEnumerable<Task<string>> tasks)
    {
        Task<string>[] all = tasks.ToArray();

        try
        {
            await Task.WhenAll(all);
        }
        catch (Exception)
        {
            // Every outcome is on its own task; the throw only reported one.
        }

        List<string> successes = all
            .Where(task => task.IsCompletedSuccessfully)
            .Select(task => task.Result)
            .ToList();

        List<string> failures = all
            .Where(task => task.IsFaulted)
            .Select(task => task.Exception!.InnerException!.Message)
            .ToList();

        return new Outcome(successes, failures);
    }

    /// <summary>
    /// Starts one fetch per id - all of them, before waiting for any - and
    /// returns "id=result" for the ones that worked, ordered by id (ordinal).
    /// The ones that failed are simply not in the list.
    /// </summary>
    public static async Task<List<string>> LookupAsync(
        IEnumerable<string> ids, Func<string, Task<string>> fetch)
    {
        var started = ids
            .Select(id => new { Id = id, Task = fetch(id) })
            .ToList();

        foreach (var entry in started)
        {
            try
            {
                await entry.Task;
            }
            catch (Exception)
            {
                // Recorded on the task; not an error for this method.
            }
        }

        return started
            .Where(entry => entry.Task.IsCompletedSuccessfully)
            .OrderBy(entry => entry.Id, StringComparer.Ordinal)
            .Select(entry => $"{entry.Id}={entry.Task.Result}")
            .ToList();
    }
}
