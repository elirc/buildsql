// d16_delegates_lambdas / ex7 - functional plumbing: bind, flip, pipe.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 7".

namespace CSharpDojo.D16_DelegatesLambdas;

public static class Currying
{
    /// <summary>
    /// Fixes the FIRST argument of a two-argument function:
    /// Bind(divide, 100) is a function of one argument b returning divide(100, b).
    /// </summary>
    public static Func<TSecond, TResult> Bind<TFirst, TSecond, TResult>(
        Func<TFirst, TSecond, TResult> f, TFirst first)
    {
        throw new NotImplementedException("ex7: Bind is not implemented yet - edit this file.");
    }

    /// <summary>Swaps a two-argument function's parameters: Flip(f)(b, a) is f(a, b).</summary>
    public static Func<TSecond, TFirst, TResult> Flip<TFirst, TSecond, TResult>(
        Func<TFirst, TSecond, TResult> f)
    {
        throw new NotImplementedException("ex7: Flip is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Chains two functions: Pipe(f, g)(x) is g(f(x)) - f runs first, its
    /// result feeds g. Note the types: f ends where g begins.
    /// </summary>
    public static Func<TIn, TOut> Pipe<TIn, TMid, TOut>(Func<TIn, TMid> f, Func<TMid, TOut> g)
    {
        throw new NotImplementedException("ex7: Pipe is not implemented yet - edit this file.");
    }
}
