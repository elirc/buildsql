// d22_exceptions / ex8 - an exception turned into a value, and back.
// See lessons/d22_exceptions/README.md, "Exercise 8".

namespace CSharpDojo.D22_Exceptions;

// The gate builds and reads these. Written for you.
public readonly record struct Attempt<T>(bool Ok, T? Value, string? Error);

public static class Safely
{
    /// <summary>
    /// Runs the function and turns a thrown exception into a failed Attempt
    /// carrying its message - except OperationCanceledException, which must
    /// escape, because a cancellation is not a failure to report.
    /// </summary>
    public static Attempt<T> Capture<T>(Func<T> function)
    {
        throw new NotImplementedException("ex8: Capture is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The value of a successful Attempt. A failed one throws an
    /// InvalidOperationException whose message is the recorded error.
    /// </summary>
    public static T Unwrap<T>(Attempt<T> attempt)
    {
        throw new NotImplementedException("ex8: Unwrap is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Runs <paramref name="next"/> on the value when the attempt succeeded,
    /// capturing anything it throws; when the attempt had already failed, the
    /// error is passed straight through and next is never called.
    /// </summary>
    public static Attempt<TOut> Then<TIn, TOut>(Attempt<TIn> attempt, Func<TIn, TOut> next)
    {
        throw new NotImplementedException("ex8: Then is not implemented yet - edit this file.");
    }
}
