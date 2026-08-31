// d17_validation / ex6 - a rule that only exists sometimes.
// See lessons/d17_validation/README.md, "Exercise 6".

namespace DotnetDojo.Api.D17_Validation;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/exotic-visits", Post);
    }

    // species must be in D17Clinic.Species ("species").
    //   species "exotic"  - permitNumber is REQUIRED and must look like
    //                       EX-1234 ("permitNumber")
    //   anything else     - permitNumber must be absent; sending one is an
    //                       error ("permitNumber")
    //   sedation true     - sedationNote is REQUIRED and non-blank
    //   sedation false    - sending a note is an error ("sedationNote")
    // 400 with every offending key, or 200 with an ExoticAccepted.
    private static IResult Post(ExoticRequest body)
    {
        var errors = new Dictionary<string, string[]>();

        if (!D17Clinic.Species.Contains(body.Species ?? ""))
        {
            errors["species"] = ["Not a species this clinic treats."];
        }

        // TODO ex6: permitNumber and sedationNote are never looked at, so an
        // exotic booking with no permit sails through and a permit number on a
        // cat is quietly ignored. Both directions of both rules matter.
        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(new ExoticAccepted(body.Species!, body.PermitNumber, body.Sedation));
    }
}
