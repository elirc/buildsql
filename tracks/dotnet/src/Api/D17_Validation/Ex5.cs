// d17_validation / ex5 - error keys that follow the shape of the body.
// See lessons/d17_validation/README.md, "Exercise 5".

namespace DotnetDojo.Api.D17_Validation;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/registrations", Post);
    }

    // Keys are dotted paths into the body. A missing "owner" is ONE error
    // keyed "owner", not one per field inside it. Otherwise: "owner.name"
    // non-blank, "owner.address" present, "owner.address.line1" non-blank,
    // "owner.address.postcode" matching a UK-style postcode once trimmed and
    // uppercased. Same for "pet", "pet.name" and "pet.species". 200 with a
    // RegistrationAccepted carrying the NORMALISED postcode.
    private static IResult Post(RegistrationRequest body) =>
        throw new NotImplementedException(
            "ex5: POST /d17/registrations is not implemented yet - edit src/Api/D17_Validation/Ex5.cs");
}
