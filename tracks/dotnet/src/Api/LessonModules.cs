// Harness, not content. The per-lesson registration convention.
//
// Any public, non-abstract class in this assembly implementing IEndpointMapper
// gets its MapEndpoints called at startup; any implementing IServiceRegistrar
// gets its Register called before the container is built. Both are discovered
// by reflection and run in a stable order (namespace, then type name), so
// L01_Routing is always wired before L07_RestCrud.
using System.Reflection;

namespace DotnetDojo.Api;

/// <summary>A lesson's HTTP surface. One implementation per lesson folder.</summary>
public interface IEndpointMapper
{
    void MapEndpoints(IEndpointRouteBuilder app);
}

/// <summary>A lesson's DI registrations. Implement only when the lesson needs services.</summary>
public interface IServiceRegistrar
{
    void Register(IServiceCollection services, IConfiguration configuration);
}

public static class LessonModules
{
    public static void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        foreach (var registrar in Instances<IServiceRegistrar>())
        {
            registrar.Register(services, configuration);
        }
    }

    public static void MapEndpoints(IEndpointRouteBuilder app)
    {
        foreach (var mapper in Instances<IEndpointMapper>())
        {
            mapper.MapEndpoints(app);
        }
    }

    private static IEnumerable<T> Instances<T>() where T : class =>
        typeof(LessonModules).Assembly
            .GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false, IsPublic: true }
                        && typeof(T).IsAssignableFrom(t)
                        && t.GetConstructor(Type.EmptyTypes) is not null)
            .OrderBy(t => t.Namespace, StringComparer.Ordinal)
            .ThenBy(t => t.Name, StringComparer.Ordinal)
            .Select(t => (T)Activator.CreateInstance(t)!);
}
