// d15_rest_reads / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D15_RestReads;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // Two routes, two handlers, and no parsing anywhere. A literal segment
        // always outranks a parameter segment, so the registration order of
        // these two lines does not matter - and the :int constraint means
        // /d15/bikes/abc matches nothing and never reaches a handler.
        app.MapGet("/d15/bikes/available", Available);
        app.MapGet("/d15/bikes/{id:int}", One);
    }

    private static IResult Available() =>
        TypedResults.Ok(D15Network.Bikes
            .Where(b => b.Status == "available")
            .OrderBy(b => b.Id)
            .Select(b => new BikeCard(b.Id, b.Model, b.Status, b.StationCode))
            .ToList());

    private static IResult One(int id)
    {
        var bike = D15Network.Bikes.FirstOrDefault(b => b.Id == id);

        return bike is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(new BikeCard(bike.Id, bike.Model, bike.Status, bike.StationCode));
    }
}
