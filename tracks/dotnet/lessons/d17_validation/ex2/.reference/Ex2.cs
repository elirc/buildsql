// d17_validation / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D17_Validation;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/owners", Post);
    }

    private static IResult Post(OwnerRequest body)
    {
        var errors = new Dictionary<string, string[]>();

        // Normalise first. Every check below - and every value echoed back -
        // is about the cleaned form, so "  Ada  " and "Ada" are one person.
        string name = body.Name?.Trim() ?? "";
        if (name.Length == 0)
        {
            errors["name"] = ["A name is required."];
        }

        string email = (body.Email ?? "").Trim().ToLowerInvariant();
        string[] halves = email.Split('@');
        if (halves.Length != 2 || halves[0].Length == 0 || halves[1].Length == 0)
        {
            errors["email"] = ["An email address needs exactly one @, with something on each side."];
        }

        string phone = (body.Phone ?? "")
            .Replace(" ", "")
            .Replace("-", "")
            .Replace("(", "")
            .Replace(")", "");
        if (phone.Length < 10 || phone.Length > 13 || !phone.All(char.IsAsciiDigit))
        {
            errors["phone"] = ["A phone number is 10 to 13 digits, however it is punctuated."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(new OwnerAccepted(name, email, phone));
    }
}
