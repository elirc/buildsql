// 12_exceptions - shared types. You never edit this file.

namespace CSharpDojo.L12_Exceptions;

/// <summary>
/// A failure that might go away if you try again - a timeout, a busy server.
/// Used by ex3 and by the challenge.
/// </summary>
public class TransientException : Exception
{
    public TransientException(string message, int statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public int StatusCode { get; }
}
