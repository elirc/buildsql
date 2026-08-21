// i2_interview_drills / ex6 - reference solution (author only, used by `dojo verify`).

using DotnetDojo.Api.I1_InterviewConcepts;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i2/tasks/overview", Overview);
    }

    private static async Task<IResult> Overview(TrackerDb db)
    {
        var overview = await db.Tasks
            .OrderBy(t => t.Id)
            .Select(t => new TaskWithProject(t.Id, t.Title, t.Project!.Name))
            .ToListAsync();

        return TypedResults.Ok(overview);
    }
}
