// i3_interview_rapidfire / ex3 - reference solution (author only, used by `dojo verify`).

using DotnetDojo.Api.I1_InterviewConcepts;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public record CompleteResult(int Changes, bool Done);

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i3/tasks/{id:int}/complete", Complete);
    }

    private static async Task<IResult> Complete(int id, bool tracked, TrackerDb db)
    {
        IQueryable<TaskItem> query = tracked ? db.Tasks.AsQueryable() : db.Tasks.AsNoTracking();

        var task = await query.FirstOrDefaultAsync(t => t.Id == id);
        if (task is null)
        {
            return TypedResults.NotFound();
        }

        task.Done = true;
        int changes = await db.SaveChangesAsync();

        return TypedResults.Ok(new CompleteResult(changes, task.Done));
    }
}
