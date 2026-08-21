// i2_interview_drills / ex3 - "make this PUT idempotent." Time-box: 15 minutes.
// See lessons/i2_interview_drills/README.md, "Drill 3".

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/i2/settings/{key}", PutSetting);
    }

    // A blank value is a 400 validation problem keyed "value".
    // A key that did not exist is created: 201, with a Location of
    // /i2/settings/{key}.
    // A key that did exist is replaced: 204 - and sending the identical request
    // again is still 204.
    private static IResult PutSetting(string key, SettingValue request, ISettingStore store) =>
        throw new NotImplementedException("ex3: PUT /i2/settings/{key} is not implemented yet - edit src/Api/I2_InterviewDrills/Ex3.cs");
}
