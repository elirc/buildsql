// Harness, not content. An ILoggerProvider that counts EF Core's
// "CommandExecuted" log events, i.e. round trips to the database.
//
// This is what lets a gate say "correct, but it took six queries" - the
// difference between an Include/projection and an N+1 loop is invisible in the
// response body and obvious here.
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace DotnetDojo.Gates;

public sealed class CommandCounter : ILoggerProvider
{
    private int _count;

    public int Count => Volatile.Read(ref _count);

    public void Reset() => Volatile.Write(ref _count, 0);

    public ILogger CreateLogger(string categoryName) =>
        categoryName == DbLoggerCategory.Database.Command.Name
            ? new CountingLogger(this)
            : NullLogger.Instance;

    public void Dispose()
    {
    }

    private void Increment() => Interlocked.Increment(ref _count);

    private sealed class CountingLogger(CommandCounter owner) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => logLevel >= LogLevel.Information;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            if (eventId.Id == RelationalEventId.CommandExecuted.Id)
            {
                owner.Increment();
            }
        }
    }
}
