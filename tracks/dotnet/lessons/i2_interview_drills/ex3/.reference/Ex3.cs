// i2_interview_drills / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/i2/settings/{key}", PutSetting);
    }

    private static IResult PutSetting(string key, SettingValue request, ISettingStore store)
    {
        if (string.IsNullOrWhiteSpace(request.Value))
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["value"] = ["Value is required."] });
        }

        bool created = store.Set(key, request.Value);

        return created
            ? TypedResults.Created($"/i2/settings/{key}", new SettingValue(request.Value))
            : TypedResults.NoContent();
    }
}
