// d22_integration_testing / ex1 - state that belongs to the host, not the process.
// See lessons/d22_integration_testing/README.md, "Exercise 1".

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex1 : IEndpointMapper
{
    // TODO ex1: these two fields are static, so there is exactly one of each
    // for the whole test run. Every host built in this process shares them,
    // which means one gate's POST shows up in another gate's GET and the order
    // the tests happen to run in decides whether they pass. HoldDesk is
    // already registered as a singleton in Model.cs - ask for it instead.
    private static readonly List<Hold> Placed = [];
    private static int _lastId;

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/holds", Place);
        app.MapGet("/d22/holds", All);
    }

    // 201 with Location /d22/holds/{id} and the new Hold as the body.
    private static IResult Place(NewHold request)
    {
        var hold = new Hold(Interlocked.Increment(ref _lastId), request.Code, request.CardId);
        Placed.Add(hold);

        return TypedResults.Created($"/d22/holds/{hold.Id}", hold);
    }

    // 200 with every hold placed on THIS host, id ascending.
    private static IResult All() =>
        TypedResults.Ok(Placed.OrderBy(h => h.Id).ToList());
}
