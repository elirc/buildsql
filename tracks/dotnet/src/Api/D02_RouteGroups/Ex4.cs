// d02_route_groups / ex4 - one filter, every endpoint in the group.
// See lessons/d02_route_groups/README.md, "Exercise 4".

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/kitchen");

        // TODO ex4: add ONE endpoint filter to the group so that every
        // endpoint below is covered by it. See the README for the rules.

        group.MapGet("/orders", () => TypedResults.Text("orders"));
        group.MapGet("/status", () => TypedResults.Text("open"));
    }
}
