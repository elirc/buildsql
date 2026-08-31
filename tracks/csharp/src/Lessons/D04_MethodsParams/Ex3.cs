// d04_methods_params / ex3 - the Try-pattern with two out parameters.
// See lessons/d04_methods_params/README.md, "Exercise 3".

namespace CSharpDojo.D04_MethodsParams;

public static class Parsing
{
    /// <summary>
    /// Read a range written as "low-high" - for example "3-9". Whitespace
    /// around either number is ignored. Both numbers must be non-negative
    /// whole numbers and low must not be greater than high.
    /// On any failure return false with both out parameters set to 0.
    /// </summary>
    public static bool TryRange(string? text, out int low, out int high)
    {
        throw new NotImplementedException("ex3: TryRange is not implemented yet - edit this file.");
    }
}
