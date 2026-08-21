// 09_delegates_events_lambdas / challenge - a middleware pipeline built from functions.
// See lessons/09_delegates_events_lambdas/README.md, "Challenge".

namespace CSharpDojo.L09_DelegatesEventsLambdas;

public static class Middleware
{
    /// <summary>
    /// Wrap <paramref name="core"/> in each middleware, so that the FIRST one
    /// listed is the outermost - it sees the request first and the response
    /// last. Each middleware is handed the next handler and returns a new one.
    /// A middleware that never calls its next short-circuits the rest.
    /// </summary>
    public static Func<string, string> Build(
        Func<string, string> core,
        params Func<Func<string, string>, Func<string, string>>[] middleware)
    {
        Func<string, string> handler = core;
        for (int i = middleware.Length - 1; i >= 0; i--)
        {
            handler = middleware[i](handler);
        }

        return handler;
    }
}
