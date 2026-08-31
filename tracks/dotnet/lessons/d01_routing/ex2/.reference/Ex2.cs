// d01_routing / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D01_Routing;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/departures/{line}/{hour:int:range(0,23)}", GetDepartures);
    }

    private static IResult GetDepartures(string line, int hour)
    {
        if (!Network.Lines.Contains(line))
        {
            return TypedResults.NotFound();
        }

        var destinations = Network.Departures
            .Where(d => d.Line == line && d.Hour == hour)
            .Select(d => d.Destination)
            .OrderBy(d => d, StringComparer.Ordinal)
            .ToList();

        return TypedResults.Ok(destinations);
    }
}
