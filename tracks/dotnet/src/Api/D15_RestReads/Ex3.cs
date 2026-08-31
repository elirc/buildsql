// d15_rest_reads / ex3 - an optional filter that is still validated.
// See lessons/d15_rest_reads/README.md, "Exercise 3".

namespace DotnetDojo.Api.D15_RestReads;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/bikes", List);
    }

    // 200 with bikes as BikeCards, id ascending. ?status= narrows to one of
    // D15Network.Statuses; absent means all of them; a status outside that
    // list is 400 as a validation problem keyed "status"; a legal status that
    // matches nothing is 200 with an empty array.
    private static IResult List(string? status) =>
        // TODO ex3: an unknown status is silently treated as "matches
        // nothing", so a client typo looks exactly like an empty fleet.
        TypedResults.Ok(D15Network.Bikes
            .Where(b => status is null || b.Status == status)
            .OrderBy(b => b.Id)
            .Select(b => new BikeCard(b.Id, b.Model, b.Status, b.StationCode))
            .ToList());
}
