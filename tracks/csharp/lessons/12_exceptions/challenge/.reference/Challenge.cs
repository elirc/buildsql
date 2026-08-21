// 12_exceptions / challenge - retry the retryable, and nothing else.
// See lessons/12_exceptions/README.md, "Challenge".

namespace CSharpDojo.L12_Exceptions;

public static class Resilient
{
    /// <summary>
    /// Call <paramref name="work"/> until it succeeds or until it has failed
    /// <paramref name="maxAttempts"/> times with a TransientException.
    ///
    /// Success returns (how many attempts it took, the value, "ok").
    /// Running out of attempts returns (maxAttempts, 0, "exhausted").
    /// Any other exception is not this method's business: let it out
    /// immediately, without another attempt.
    /// </summary>
    public static (int Attempts, int Value, string Outcome) Run(Func<int> work, int maxAttempts)
    {
        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                return (attempt, work(), "ok");
            }
            catch (TransientException) when (attempt < maxAttempts)
            {
                // Transient and there are attempts left: go round again.
            }
            catch (TransientException)
            {
                return (attempt, 0, "exhausted");
            }
        }

        return (maxAttempts, 0, "exhausted");
    }
}
