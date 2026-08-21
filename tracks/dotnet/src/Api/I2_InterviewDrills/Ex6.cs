// i2_interview_drills / ex6 - "this list endpoint is slow." Time-box: 15 minutes.
// See lessons/i2_interview_drills/README.md, "Drill 6".

using DotnetDojo.Api.I1_InterviewConcepts;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i2/tasks/overview", Overview);
    }

    // Correct answers, far too many round trips.
    private static async Task<IResult> Overview(TrackerDb db)
    {
        var tasks = await db.Tasks.OrderBy(t => t.Id).ToListAsync();
        var overview = new List<TaskWithProject>();

        foreach (var task in tasks)
        {
            var project = await db.Projects.FirstAsync(p => p.Id == task.ProjectId);
            overview.Add(new TaskWithProject(task.Id, task.Title, project.Name));
        }

        return TypedResults.Ok(overview);
    }
}
