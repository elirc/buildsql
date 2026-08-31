// d17_validation / ex5 - reference solution (author only, used by `dojo verify`).

using System.Text.RegularExpressions;

namespace DotnetDojo.Api.D17_Validation;

public class Ex5 : IEndpointMapper
{
    private static readonly Regex Postcode =
        new(@"^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$", RegexOptions.Compiled);

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/registrations", Post);
    }

    private static IResult Post(RegistrationRequest body)
    {
        var errors = new Dictionary<string, string[]>();
        string ownerName = "";
        string postcode = "";
        string petName = "";
        string species = "";

        // A missing block is ONE error, and the fields inside it are simply
        // not reachable - nesting the checks is what stops four messages about
        // an object the client never sent.
        if (body.Owner is null)
        {
            errors["owner"] = ["An owner is required."];
        }
        else
        {
            ownerName = body.Owner.Name?.Trim() ?? "";
            if (ownerName.Length == 0)
            {
                errors["owner.name"] = ["A name is required."];
            }

            if (body.Owner.Address is null)
            {
                errors["owner.address"] = ["An address is required."];
            }
            else
            {
                if ((body.Owner.Address.Line1?.Trim() ?? "").Length == 0)
                {
                    errors["owner.address.line1"] = ["The first line of the address is required."];
                }

                postcode = (body.Owner.Address.Postcode ?? "").Trim().ToUpperInvariant();
                if (!Postcode.IsMatch(postcode))
                {
                    errors["owner.address.postcode"] = ["That is not a postcode, for example EC1A 1BB."];
                }
            }
        }

        if (body.Pet is null)
        {
            errors["pet"] = ["A pet is required."];
        }
        else
        {
            petName = body.Pet.Name?.Trim() ?? "";
            if (petName.Length == 0)
            {
                errors["pet.name"] = ["A pet name is required."];
            }

            species = body.Pet.Species ?? "";
            if (!D17Clinic.Species.Contains(species))
            {
                errors["pet.species"] = ["Not a species this clinic treats."];
            }
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(new RegistrationAccepted(ownerName, postcode, petName, species));
    }
}
