// i3_interview_rapidfire / review1 - reference solution (author only, used by `dojo verify`).

using DotnetDojo.Api.I2_InterviewDrills;

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public record SecretResponse(string Value);

public class Review1Services : IServiceRegistrar
{
    public const string MembersOnly = "i3-members-only";

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(MembersOnly, policy => policy
                .AddAuthenticationSchemes(I2Jwt.Scheme)
                .RequireAuthenticatedUser()
                .RequireRole("member"));
    }
}

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i3/review/secret", Secret)
            .RequireAuthorization(Review1Services.MembersOnly);
    }

    private static IResult Secret() => TypedResults.Ok(new SecretResponse("the dojo is closed"));
}
