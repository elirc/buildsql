// d16_delegates_lambdas / ex6 - two lambdas sharing one captured variable.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 6".

namespace CSharpDojo.D16_DelegatesLambdas;

public static class Accounts
{
    /// <summary>
    /// A tiny account with no class: returns a Deposit action and a Balance
    /// query that CLOSE OVER THE SAME local variable, so what one writes the
    /// other reads. Each call to MakeAccount creates a fresh, independent
    /// balance. A negative deposit throws ArgumentOutOfRangeException.
    /// </summary>
    public static (Action<int> Deposit, Func<int> Balance) MakeAccount(int opening)
    {
        throw new NotImplementedException("ex6: MakeAccount is not implemented yet - edit this file.");
    }
}
