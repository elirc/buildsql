// d02_route_groups / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/trace");

        group.AddEndpointFilter(new ReportFilter());
        group.AddEndpointFilter(new MarkFilter("a"));
        group.AddEndpointFilter(new MarkFilter("b"));

        group.MapGet("/run", Run).AddEndpointFilter(new MarkFilter("c"));
    }

    private static IResult Run(HttpContext http)
    {
        D02Trace.Mark(http, "handler");

        return TypedResults.Ok("handler");
    }
}
