// d04_methods_params / ex4 - ref means the caller's variable itself.
// See lessons/d04_methods_params/README.md, "Exercise 4".

namespace CSharpDojo.D04_MethodsParams;

public static class Mutate
{
    /// <summary>Multiply BOTH of the caller's variables by the factor.</summary>
    public static void Scale(ref int x, ref int y, int factor)
    {
        throw new NotImplementedException("ex4: Scale is not implemented yet - edit this file.");
    }

    /// <summary>
    /// If a is greater than b, swap the caller's two variables and return true.
    /// Otherwise leave them alone and return false.
    /// </summary>
    public static bool SwapIfOutOfOrder(ref int a, ref int b)
    {
        throw new NotImplementedException("ex4: SwapIfOutOfOrder is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Return count + 1. The parameter is BY VALUE, so assigning to it inside
    /// this method must not - and cannot - change the caller's variable.
    /// </summary>
    public static int BumpByValue(int count)
    {
        throw new NotImplementedException("ex4: BumpByValue is not implemented yet - edit this file.");
    }
}
