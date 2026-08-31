// d02_route_groups - given code, not an exercise. Read it, do not edit it.
//
// Five recipes, three courses, two kitchens, and the two filter types ex6
// needs. Everything else in this lesson is yours to write.

namespace DotnetDojo.Api.D02_RouteGroups;

public record Recipe(int Id, string Slug, string Title, int Minutes, string Course);

public record Envelope(List<string> Items, int Count);

public static class Cookbook
{
    public static readonly IReadOnlyList<Recipe> Recipes =
    [
        new(1, "miso-soup", "Miso soup", 15, "starter"),
        new(2, "katsu-curry", "Katsu curry", 45, "main"),
        new(3, "gyoza", "Gyoza", 40, "starter"),
        new(4, "matcha-cake", "Matcha cake", 60, "dessert"),
        new(5, "ramen", "Ramen", 90, "main"),
    ];

    /// <summary>Which courses each kitchen is allowed to serve. ex8 needs this.</summary>
    public static readonly IReadOnlyDictionary<string, string[]> Kitchens =
        new Dictionary<string, string[]>
        {
            ["north"] = ["starter", "main"],
            ["south"] = ["dessert"],
        };
}

// -- ex6: the two filters whose order you are being asked to arrange ----------

/// <summary>A per-request list of marks. Same idea as lesson 03's PipelineTrace.</summary>
public static class D02Trace
{
    private const string Key = "d02.trace";

    public static void Mark(HttpContext context, string mark)
    {
        if (context.Items[Key] is not List<string> marks)
        {
            marks = [];
            context.Items[Key] = marks;
        }

        marks.Add(mark);
    }

    public static string Read(HttpContext context) =>
        context.Items[Key] is List<string> marks ? string.Join(",", marks) : "";
}

/// <summary>Marks the trace on the way in and again on the way out.</summary>
public sealed class MarkFilter(string name) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        D02Trace.Mark(context.HttpContext, name + ">");
        var result = await next(context);
        D02Trace.Mark(context.HttpContext, name + "<");

        return result;
    }
}

/// <summary>Waits for everything else, then answers with the finished trace.</summary>
public sealed class ReportFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        await next(context);

        return TypedResults.Ok(D02Trace.Read(context.HttpContext));
    }
}
