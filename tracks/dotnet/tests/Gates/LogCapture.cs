// Harness, not content. An ILoggerProvider that keeps every log entry the app
// writes, so a gate can assert on what was logged and not only on what was
// returned.
//
// The State list is the part that matters for structured logging: a call to
//
//     logger.LogInformation("Order {OrderId} shipped to {City}", id, city);
//
// produces state entries OrderId=42, City="Kyoto" and {OriginalFormat}=the
// template. Interpolating the values into the string instead produces only
// {OriginalFormat}, with the values baked in and no named properties at all -
// which is exactly the mistake these gates are looking for.
using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace DotnetDojo.Gates;

public sealed record LogEntry(
    string Category,
    LogLevel Level,
    string Message,
    Exception? Exception,
    IReadOnlyList<KeyValuePair<string, object?>> State)
{
    public object? Property(string name)
    {
        foreach (var pair in State)
        {
            if (pair.Key == name)
            {
                return pair.Value;
            }
        }

        return null;
    }

    public bool Has(string name) => State.Any(p => p.Key == name);

    public override string ToString() =>
        $"[{Level}] {Category}: {Message}"
        + (Exception is null ? "" : $" (+{Exception.GetType().Name})")
        + "  state: {" + string.Join(", ", State.Select(p => $"{p.Key}={p.Value}")) + "}";
}

public sealed class LogCapture : ILoggerProvider
{
    private readonly ConcurrentQueue<LogEntry> _entries = new();

    /// <summary>Everything logged so far, oldest first.</summary>
    public IReadOnlyList<LogEntry> Entries => _entries.ToArray();

    public void Clear() => _entries.Clear();

    /// <summary>Entries written by the learner's own code, i.e. not by the framework.</summary>
    public IReadOnlyList<LogEntry> FromApi =>
        _entries.Where(e => e.Category.StartsWith("DotnetDojo.Api", StringComparison.Ordinal)).ToArray();

    public string Dump() =>
        Entries.Count == 0
            ? "  (nothing was logged at all)"
            : string.Join("\n", Entries.Select(e => "  " + e));

    public ILogger CreateLogger(string categoryName) => new CapturingLogger(categoryName, this);

    public void Dispose()
    {
    }

    private void Add(LogEntry entry) => _entries.Enqueue(entry);

    private sealed class CapturingLogger(string category, LogCapture owner) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => logLevel != LogLevel.None;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            var properties = state as IReadOnlyList<KeyValuePair<string, object?>> ?? [];
            owner.Add(new LogEntry(
                category,
                logLevel,
                formatter(state, exception),
                exception,
                properties));
        }
    }
}
