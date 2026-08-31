// d16_delegates_lambdas / ex2 - combining predicates, short-circuit included.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 2".

namespace CSharpDojo.D16_DelegatesLambdas;

public static class Predicates
{
    /// <summary>
    /// A predicate that passes only when BOTH pass - and, like &amp;&amp;, never
    /// calls <paramref name="second"/> when <paramref name="first"/> already
    /// said no.
    /// </summary>
    public static Func<T, bool> Both<T>(Func<T, bool> first, Func<T, bool> second)
    {
        throw new NotImplementedException("ex2: Both is not implemented yet - edit this file.");
    }

    /// <summary>
    /// A predicate that passes when EITHER passes - and, like ||, never calls
    /// <paramref name="second"/> when <paramref name="first"/> already said yes.
    /// </summary>
    public static Func<T, bool> Either<T>(Func<T, bool> first, Func<T, bool> second)
    {
        throw new NotImplementedException("ex2: Either is not implemented yet - edit this file.");
    }
}
