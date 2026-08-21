// 08_errors_logging - given code, not an exercise. Read it, do not edit it.
//
// A terminal handler that throws on demand, so each exercise can point a
// pipeline at it and see what its middleware does with the wreckage.

namespace DotnetDojo.Api.L08_ErrorsLogging;

/// <summary>The caller asked for something that is not there.</summary>
public class NotFoundException(string message) : Exception(message);

/// <summary>The caller sent something this system cannot accept.</summary>
public class ValidationFailedException(string field, string message) : Exception(message)
{
    public string Field { get; } = field;
}

public static class Trap
{
    /// <summary>Deliberately careless: a message that must never reach a client.</summary>
    public const string Secret = "connection string is postgres://dojo:hunter2@db/orders";

    /// <summary>
    /// A path ending in /missing throws NotFoundException, /invalid throws
    /// ValidationFailedException, /boom throws InvalidOperationException, and
    /// anything else answers 200 with "ok".
    /// </summary>
    public static Task Handle(HttpContext context)
    {
        string path = context.Request.Path.Value ?? "";

        if (path.EndsWith("/missing", StringComparison.Ordinal))
        {
            throw new NotFoundException("no such widget");
        }

        if (path.EndsWith("/invalid", StringComparison.Ordinal))
        {
            throw new ValidationFailedException("name", "Name is required.");
        }

        if (path.EndsWith("/boom", StringComparison.Ordinal))
        {
            throw new InvalidOperationException(Secret);
        }

        return context.Response.WriteAsync("ok");
    }
}
