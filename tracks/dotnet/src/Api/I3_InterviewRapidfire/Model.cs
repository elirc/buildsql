// i3_interview_rapidfire - given code, not an exercise. Do not edit it.

using System.Collections.Concurrent;

namespace DotnetDojo.Api.I3_InterviewRapidfire;

// -- ex1: three services whose only job is to have a lifetime -----------------

public interface IAppWide
{
    Guid Value { get; }
}

public sealed class AppWide : IAppWide
{
    public Guid Value { get; } = Guid.NewGuid();
}

public interface IPerRequest
{
    Guid Value { get; }
}

public sealed class PerRequest : IPerRequest
{
    public Guid Value { get; } = Guid.NewGuid();
}

public interface IPerCall
{
    Guid Value { get; }
}

public sealed class PerCall : IPerCall
{
    public Guid Value { get; } = Guid.NewGuid();
}

public record LifetimeResponse(Guid App, Guid Request1, Guid Request2, Guid Call1, Guid Call2);

// -- ex2: two middlewares, one of which stops the request ---------------------

public class SeenMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers["X-Seen"] = "yes";
        return next(context);
    }
}

public class RefuseMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.Value?.EndsWith("/nope", StringComparison.Ordinal) == true)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }

        return next(context);
    }
}

// -- ex4: the smallest possible resource --------------------------------------

public record Code(int Id, string Value);

public record NewCode(string? Value);

public interface ICodeStore
{
    int Count { get; }

    Code? Find(int id);

    bool Exists(string value);

    Code Add(string value);

    bool Remove(int id);
}

public sealed class CodeStore : ICodeStore
{
    private readonly List<Code> _codes = [new(1, "alpha")];

    private int _next = 2;

    public int Count
    {
        get
        {
            lock (_codes)
            {
                return _codes.Count;
            }
        }
    }

    public Code? Find(int id)
    {
        lock (_codes)
        {
            return _codes.FirstOrDefault(c => c.Id == id);
        }
    }

    public bool Exists(string value)
    {
        lock (_codes)
        {
            return _codes.Any(c => c.Value == value);
        }
    }

    public Code Add(string value)
    {
        lock (_codes)
        {
            var code = new Code(_next++, value);
            _codes.Add(code);
            return code;
        }
    }

    public bool Remove(int id)
    {
        lock (_codes)
        {
            int index = _codes.FindIndex(c => c.Id == id);
            if (index < 0)
            {
                return false;
            }

            _codes.RemoveAt(index);
            return true;
        }
    }
}

public class I3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<ICodeStore, CodeStore>();
    }
}
