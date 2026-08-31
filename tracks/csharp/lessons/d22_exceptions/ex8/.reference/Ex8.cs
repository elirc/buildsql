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
        try
        {
            return new Attempt<T>(true, function(), null);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            return new Attempt<T>(false, default, ex.Message);
        }
    }

    /// <summary>
    /// The value of a successful Attempt. A failed one throws an
    /// InvalidOperationException whose message is the recorded error.
    /// </summary>
    public static T Unwrap<T>(Attempt<T> attempt)
    {
        if (!attempt.Ok)
        {
            throw new InvalidOperationException(attempt.Error);
        }

        return attempt.Value!;
    }

    /// <summary>
    /// Runs <paramref name="next"/> on the value when the attempt succeeded,
    /// capturing anything it throws; when the attempt had already failed, the
    /// error is passed straight through and next is never called.
    /// </summary>
    public static Attempt<TOut> Then<TIn, TOut>(Attempt<TIn> attempt, Func<TIn, TOut> next)
    {
        if (!attempt.Ok)
        {
            return new Attempt<TOut>(false, default, attempt.Error);
        }

        return Capture(() => next(attempt.Value!));
    }
}
