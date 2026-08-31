// d17_validation / ex2 - normalise first, then judge.
// See lessons/d17_validation/README.md, "Exercise 2".

namespace DotnetDojo.Api.D17_Validation;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/owners", Post);
    }

    // Normalise, then validate, then echo the NORMALISED values:
    //   name  - trimmed; blank after trimming is an error ("name")
    //   email - trimmed and lowercased; must have exactly one "@" with a
    //           non-empty side either way ("email")
    //   phone - spaces, dashes and parentheses removed; what is left must be
    //           10 to 13 digits ("phone")
    // 400 with every offending key, or 200 with an OwnerAccepted.
    private static IResult Post(OwnerRequest body) =>
        throw new NotImplementedException(
            "ex2: POST /d17/owners is not implemented yet - edit src/Api/D17_Validation/Ex2.cs");
}
