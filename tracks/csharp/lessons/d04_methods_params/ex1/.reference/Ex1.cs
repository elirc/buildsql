// d04_methods_params / ex1 - optional arguments, and calling them by name.
// See lessons/d04_methods_params/README.md, "Exercise 1".

namespace CSharpDojo.D04_MethodsParams;

public static class Log
{
    /// <summary>
    /// A log line: "[LEVEL] message", or "[LEVEL] (source) message" when a
    /// source is given. The level defaults to "INFO" and there is no source
    /// by default.
    /// </summary>
    public static string Line(string message, string level = "INFO", string? source = null)
    {
        return source is null
            ? $"[{level}] {message}"
            : $"[{level}] ({source}) {message}";
    }

    /// <summary>
    /// A bullet: <paramref name="indent"/> spaces, then the marker, then one
    /// space, then the text. The marker defaults to "-" and the indent to 0.
    /// </summary>
    public static string Bullet(string text, string marker = "-", int indent = 0)
    {
        return new string(' ', indent) + marker + " " + text;
    }
}
