// d04_methods_params / ex8 - a command-line parser: params in, options out.
// See lessons/d04_methods_params/README.md, "Exercise 8".

namespace CSharpDojo.D04_MethodsParams;

public static class Args
{
    /// <summary>
    /// Read "--" options out of a command line. Everything that does not start
    /// with "--" and is not consumed as a value is ignored.
    ///
    /// - "--key=value" stores value under key.
    /// - "--key value" stores value under key and consumes the next token,
    ///   but only when that token does not itself start with "--".
    /// - "--flag" with nothing usable after it stores "true".
    /// Keys are lower-cased with the leading "--" removed, and a key given
    /// twice keeps the LAST value.
    /// </summary>
    public static Dictionary<string, string> Parse(params string[] args)
    {
        throw new NotImplementedException("ex8: Parse is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The value stored under key, or <paramref name="fallback"/> (which is ""
    /// unless the caller says otherwise) when the key is not there.
    /// </summary>
    public static string ValueOr(IReadOnlyDictionary<string, string> options, string key, string fallback = "")
    {
        throw new NotImplementedException("ex8: ValueOr is not implemented yet - edit this file.");
    }
}
