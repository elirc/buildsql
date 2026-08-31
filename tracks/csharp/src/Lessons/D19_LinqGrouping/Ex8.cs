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
        throw new NotImplementedException("ex8: ErrorReport is not implemented yet - edit this file.");
    }

    /// <summary>
    /// "fast=3", "normal=1", "slow=0" - always those three, always in that
    /// order, even when a bucket is empty. fast is under 100ms, normal is
    /// under 1000ms, slow is 1000ms or more.
    /// </summary>
    public static List<string> LatencyHistogram(IEnumerable<LogEntry> logs)
    {
        throw new NotImplementedException("ex8: LatencyHistogram is not implemented yet - edit this file.");
    }
}
