// 12_exceptions / ex2 - your own exception type, and keeping the cause.
// See lessons/12_exceptions/README.md, "Exercise 2".

namespace CSharpDojo.L12_Exceptions;

/// <summary>
/// Thrown when configuration cannot be understood. Both constructors are
/// yours to write; the second one is the important one.
/// </summary>
public class ConfigurationException : Exception
{
    public ConfigurationException(string message)
        : base(message)
    {
    }

    public ConfigurationException(string message, Exception inner)
        : base(message, inner)
    {
    }
}

public static class Configuration
{
    /// <summary>
    /// Parse a port number. Anything that cannot be parsed - including null -
    /// becomes a ConfigurationException whose message is
    /// "bad port: &lt;text&gt;" (or "bad port: null") and whose InnerException
    /// is whatever int.Parse actually threw.
    /// </summary>
    public static int LoadPort(string? text)
    {
        try
        {
            return int.Parse(text!);
        }
        catch (Exception original) when (original is FormatException or ArgumentNullException)
        {
            throw new ConfigurationException($"bad port: {text ?? "null"}", original);
        }
    }
}
