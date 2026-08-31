// d15_rest_reads / ex1 - a collection and an item are two different resources.
// See lessons/d15_rest_reads/README.md, "Exercise 1".

namespace DotnetDojo.Api.D15_RestReads;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/stations", All);
        app.MapGet("/d15/stations/{code}", One);
    }

    // 200 with every station as a StationCard, code A-Z.
    private static IResult All() =>
        // TODO ex1: the seed order is not the contract's order, and a Station
        // is not a StationCard - it has no available count at all.
        TypedResults.Ok(D15Network.Stations);

    // 200 with that station's StationCard, or 404 when there is no such code.
    private static IResult One(string code) =>
        // TODO ex1: First throws when nothing matches, and a thrown exception
        // is a 500. "Not there" is an answer, not a crash.
        TypedResults.Ok(D15Network.Stations.First(s => s.Code == code));
}
