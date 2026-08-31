// d01_routing / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D01_Routing;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/zones/{zone}", GetZone);
        app.MapGet("/d01/zones/all", ListZones);
    }

    private static IResult ListZones() =>
        TypedResults.Ok(Network.Stops
            .Select(s => s.Zone)
            .Distinct()
            .OrderBy(z => z, StringComparer.Ordinal)
            .ToList());

    private static IResult GetZone(string zone)
    {
        var names = Network.Stops
            .Where(s => s.Zone == zone)
            .Select(s => s.Name)
            .OrderBy(n => n, StringComparer.Ordinal)
            .ToList();

        return names.Count == 0 ? TypedResults.NotFound() : TypedResults.Ok(names);
    }
}
