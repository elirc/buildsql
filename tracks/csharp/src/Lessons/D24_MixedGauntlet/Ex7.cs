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
        throw new NotImplementedException("ex7: GatherAsync is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Starts one fetch per id - all of them, before waiting for any - and
    /// returns "id=result" for the ones that worked, ordered by id (ordinal).
    /// The ones that failed are simply not in the list.
    /// </summary>
    public static async Task<List<string>> LookupAsync(
        IEnumerable<string> ids, Func<string, Task<string>> fetch)
    {
        throw new NotImplementedException("ex7: LookupAsync is not implemented yet - edit this file.");
    }
}
