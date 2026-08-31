// d19_linq_grouping / ex8 - a report, and the buckets that stay empty.
// See lessons/d19_linq_grouping/README.md, "Exercise 8".

namespace CSharpDojo.D19_LinqGrouping;

// The gate builds these. Written for you.
public record LogEntry(string Service, string Level, int Millis);

public static class Analytics
{
    /// <summary>
    /// One line per service that logged at least one "error":
    /// "service errors=2 slowest=900", where slowest is the largest Millis
    /// over ALL of that service's entries, not just the errors. Ordered by
    /// error count descending, ties broken by service name (ordinal).
    /// </summary>
    public static List<string> ErrorReport(IEnumerable<LogEntry> logs)
    {
        return logs
            .GroupBy(entry => entry.Service)
            .Select(group => new
            {
                Service = group.Key,
                Errors = group.Count(entry => entry.Level == "error"),
                Slowest = group.Max(entry => entry.Millis),
            })
            .Where(row => row.Errors > 0)
            .OrderByDescending(row => row.Errors)
            .ThenBy(row => row.Service, StringComparer.Ordinal)
            .Select(row => $"{row.Service} errors={row.Errors} slowest={row.Slowest}")
            .ToList();
    }

    /// <summary>
    /// "fast=3", "normal=1", "slow=0" - always those three, always in that
    /// order, even when a bucket is empty. fast is under 100ms, normal is
    /// under 1000ms, slow is 1000ms or more.
    /// </summary>
    public static List<string> LatencyHistogram(IEnumerable<LogEntry> logs)
    {
        Dictionary<string, int> counts = logs
            .GroupBy(entry => Bucket(entry.Millis))
            .ToDictionary(group => group.Key, group => group.Count());

        string[] buckets = { "fast", "normal", "slow" };
        return buckets
            .Select(bucket => $"{bucket}={(counts.TryGetValue(bucket, out int count) ? count : 0)}")
            .ToList();
    }

    private static string Bucket(int millis)
    {
        if (millis < 100)
        {
            return "fast";
        }

        return millis < 1000 ? "normal" : "slow";
    }
}
