// d04_methods_params / ex2 - params arrays.
// See lessons/d04_methods_params/README.md, "Exercise 2".

namespace CSharpDojo.D04_MethodsParams;

public static class Paths
{
    /// <summary>
    /// Join the parts with "/", ignoring any part that is null or blank and
    /// stripping "/" from both ends of every part first, so no double slash
    /// can appear. No parts at all gives "".
    /// </summary>
    public static string Combine(params string?[] parts)
    {
        throw new NotImplementedException("ex2: Combine is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The first candidate that is not null or blank, trimmed. When there is
    /// none - including when no candidates were passed at all - "".
    /// </summary>
    public static string First(params string?[] candidates)
    {
        throw new NotImplementedException("ex2: First is not implemented yet - edit this file.");
    }
}
