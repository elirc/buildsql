// d05_di_patterns / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D05_DiPatterns;

public interface IGreetCounter
{
    int Count { get; }

    void Add();
}

public sealed class GreetCounter : IGreetCounter
{
    private int _count;

    public int Count => Volatile.Read(ref _count);

    public void Add() => Interlocked.Increment(ref _count);
}

public interface IGreetingService
{
    string Greet(string name);

    string Describe();
}

public sealed class GreetingService : IGreetingService
{
    public string Greet(string name) => $"hello {name}";

    public string Describe() => "core";
}

public sealed class ShoutingGreeting(IGreetingService inner) : IGreetingService
{
    public string Greet(string name) => inner.Greet(name).ToUpperInvariant();

    public string Describe() => "shouting>" + inner.Describe();
}

public sealed class CountingGreeting(IGreetingService inner, IGreetCounter counter) : IGreetingService
{
    public string Greet(string name)
    {
        counter.Add();

        return inner.Greet(name);
    }

    public string Describe() => "counting>" + inner.Describe();
}

public record GreetResponse(string Greeting, int Greeted, string Chain);

public class Ex8Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IGreetCounter, GreetCounter>();

        services.AddSingleton<IGreetingService, GreetingService>();

        Decorate(services, (_, inner) => new ShoutingGreeting(inner));
        Decorate(services, (sp, inner) =>
            new CountingGreeting(inner, sp.GetRequiredService<IGreetCounter>()));
    }

    /// <summary>Replaces the current IGreetingService registration with one that wraps it.</summary>
    private static void Decorate(
        IServiceCollection services,
        Func<IServiceProvider, IGreetingService, IGreetingService> wrap)
    {
        var existing = services.Last(d => d.ServiceType == typeof(IGreetingService));
        services.Remove(existing);

        services.AddSingleton<IGreetingService>(sp => wrap(sp, Build(sp, existing)));
    }

    private static IGreetingService Build(IServiceProvider sp, ServiceDescriptor descriptor)
    {
        if (descriptor.ImplementationInstance is IGreetingService instance)
        {
            return instance;
        }

        if (descriptor.ImplementationFactory is not null)
        {
            return (IGreetingService)descriptor.ImplementationFactory(sp);
        }

        return (IGreetingService)ActivatorUtilities.CreateInstance(
            sp, descriptor.ImplementationType!);
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/greet/{name}", Get);
    }

    private static IResult Get(IGreetingService greetings, IGreetCounter counter, string name) =>
        TypedResults.Ok(new GreetResponse(
            greetings.Greet(name), counter.Count, greetings.Describe()));
}
