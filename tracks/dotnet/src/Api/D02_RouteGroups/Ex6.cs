// d02_route_groups / ex6 - the order filters run in.
// See lessons/d02_route_groups/README.md, "Exercise 6".

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/trace");

        // TODO ex6: attach ReportFilter and three MarkFilters - "a", "b" and
        // "c" - so that the finished trace reads
        //     a>,b>,c>,handler,c<,b<,a<
        // Two of the marks belong on the group and one belongs on the
        // endpoint. Work out which, and in which order.

        group.MapGet("/run", Run);
    }

    // Given: marks the trace and returns something the ReportFilter throws away.
    private static IResult Run(HttpContext http)
    {
        D02Trace.Mark(http, "handler");

        return TypedResults.Ok("handler");
    }
}
