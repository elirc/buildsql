// d17_validation / ex4 - errors that say which item.
// See lessons/d17_validation/README.md, "Exercise 4".

namespace DotnetDojo.Api.D17_Validation;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/rounds", Post);
    }

    // A missing or empty list is one error keyed "visits". Otherwise every
    // visit is validated as in ex1, under keys "visits[i].petName",
    // "visits[i].species" and "visits[i].durationMinutes" - and no two visits
    // may name the same pet, compared case-insensitively, with the LATER one
    // reported under "visits[j].petName". 200 with a RoundAccepted when the
    // whole round is clean.
    private static IResult Post(RoundRequest body) =>
        throw new NotImplementedException(
            "ex4: POST /d17/rounds is not implemented yet - edit src/Api/D17_Validation/Ex4.cs");
}
