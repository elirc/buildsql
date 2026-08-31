// d22_integration_testing / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/holds", Place);
        app.MapGet("/d22/holds", All);
    }

    // The state lives in a singleton resolved from the container, so it
    // belongs to this host and dies with it. Nothing in this file is static.
    private static IResult Place(NewHold request, HoldDesk desk)
    {
        var hold = desk.Place(request.Code, request.CardId);

        return TypedResults.Created($"/d22/holds/{hold.Id}", hold);
    }

    private static IResult All(HoldDesk desk) =>
        TypedResults.Ok(desk.All().OrderBy(h => h.Id).ToList());
}
