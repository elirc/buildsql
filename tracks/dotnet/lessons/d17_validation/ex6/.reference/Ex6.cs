// d17_validation / ex6 - reference solution (author only, used by `dojo verify`).

using System.Text.RegularExpressions;

namespace DotnetDojo.Api.D17_Validation;

public class Ex6 : IEndpointMapper
{
    private static readonly Regex Permit = new(@"^EX-[0-9]{4}$", RegexOptions.Compiled);

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/exotic-visits", Post);
    }

    private static IResult Post(ExoticRequest body)
    {
        var errors = new Dictionary<string, string[]>();

        if (!D17Clinic.Species.Contains(body.Species ?? ""))
        {
            errors["species"] = ["Not a species this clinic treats."];
        }

        // Both directions. "Required when exotic" is half a rule; the other
        // half is "forbidden otherwise", and leaving it out means a permit on
        // a cat is silently dropped rather than questioned.
        if (body.Species == "exotic")
        {
            if (string.IsNullOrWhiteSpace(body.PermitNumber) || !Permit.IsMatch(body.PermitNumber.Trim()))
            {
                errors["permitNumber"] = ["An exotic visit needs a permit like EX-1234."];
            }
        }
        else if (!string.IsNullOrWhiteSpace(body.PermitNumber))
        {
            errors["permitNumber"] = ["Only an exotic visit carries a permit number."];
        }

        if (body.Sedation)
        {
            if (string.IsNullOrWhiteSpace(body.SedationNote))
            {
                errors["sedationNote"] = ["Sedation needs a note saying what and why."];
            }
        }
        else if (!string.IsNullOrWhiteSpace(body.SedationNote))
        {
            errors["sedationNote"] = ["A sedation note without sedation is a contradiction."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(new ExoticAccepted(body.Species!, body.PermitNumber, body.Sedation));
    }
}
