// d16_delegates_lambdas / ex4 - wrappers with captured state.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 4".

namespace CSharpDojo.D16_DelegatesLambdas;

public static class Guards
{
    /// <summary>
    /// Wraps an action so it runs only the FIRST time the wrapper is called;
    /// every later call does nothing. Each wrapper tracks its own "already
    /// ran" flag - two wrappers around the same action are independent.
    /// </summary>
    public static Action Once(Action action)
    {
        throw new NotImplementedException("ex4: Once is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Wraps an action so it does nothing until the wrapper has been called
    /// <paramref name="times"/> times - it runs on call number
    /// <paramref name="times"/> and on every call after that.
    /// </summary>
    public static Action After(int times, Action action)
    {
        throw new NotImplementedException("ex4: After is not implemented yet - edit this file.");
    }
}
