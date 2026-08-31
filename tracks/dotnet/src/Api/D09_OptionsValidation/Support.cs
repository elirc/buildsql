// d09_options_validation - given code, not an exercise. Read it, do not edit it.
//
// Every endpoint in this lesson does the same two things: resolve an options
// object, and answer with it - unless validation refused, in which case it
// answers 500 with the list of reasons. That is what this helper is for, so the
// exercises stay about the REGISTRATION rather than about try/catch.

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public record Failures(List<string> Messages);

public static class D09Options
{
    /// <summary>Projects the options value, or turns a validation failure into a 500.</summary>
    public static IResult Read<T>(Func<T> read, Func<T, object> project)
    {
        try
        {
            return TypedResults.Ok(project(read()));
        }
        catch (OptionsValidationException exception)
        {
            return TypedResults.Json(
                new Failures(exception.Failures.ToList()), statusCode: 500);
        }
    }
}
