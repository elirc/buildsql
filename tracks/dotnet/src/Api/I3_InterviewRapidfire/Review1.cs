// i3_interview_rapidfire / review1 - 401 versus 403, cold.
// See lessons/i3_interview_rapidfire/README.md, "Review".

using DotnetDojo.Api.I2_InterviewDrills;

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public record SecretResponse(string Value);

public class Review1Services : IServiceRegistrar
{
    public const string MembersOnly = "i3-members-only";

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO review1: a policy that authenticates on I2Jwt.Scheme and requires
        // the "member" role.
    }
}

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO review1: anyone can read this. Require the policy.
        app.MapGet("/i3/review/secret", Secret);
    }

    // Given code.
    private static IResult Secret() => TypedResults.Ok(new SecretResponse("the dojo is closed"));
}
