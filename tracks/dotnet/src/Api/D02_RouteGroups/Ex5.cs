// d02_route_groups / ex5 - a filter that reads the handler's arguments.
// See lessons/d02_route_groups/README.md, "Exercise 5".

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/pantry");

        // TODO ex5: add ONE endpoint filter to the group that rejects an id
        // above 100 with a 400 before either handler runs.

        group.MapGet("/{id:int}", (int id) => TypedResults.Text($"item {id}"));
        group.MapGet("/{id:int}/label", (int id) => TypedResults.Text($"label {id}"));
    }
}
