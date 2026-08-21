// 09_delegates_events_lambdas / ex4 - delegates are values: combine and compose them.
// See lessons/09_delegates_events_lambdas/README.md, "Exercise 4".

namespace CSharpDojo.L09_DelegatesEventsLambdas;

public static class Pipelines
{
    /// <summary>
    /// One function that runs every step in order, feeding each result into the
    /// next. With no steps at all it returns the input unchanged.
    /// </summary>
    public static Func<string, string> Compose(params Func<string, string>[] steps)
    {
        throw new NotImplementedException("ex4: Compose is not implemented yet - edit this file.");
    }

    /// <summary>
    /// One Action that runs both, first then second. Either may be null, in
    /// which case there is simply less to run; if both are null the result is
    /// an Action that does nothing.
    /// </summary>
    public static Action Combine(Action? first, Action? second)
    {
        throw new NotImplementedException("ex4: Combine is not implemented yet - edit this file.");
    }
}
