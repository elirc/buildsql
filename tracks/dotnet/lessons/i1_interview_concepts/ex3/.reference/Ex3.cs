// i1_interview_concepts / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.I1_InterviewConcepts;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i1/projects/summary", Summary);
    }

    private static async Task<IResult> Summary(TrackerDb db)
    {
        var summaries = await db.Projects
            .OrderBy(p => p.Id)
            .Select(p => new ProjectSummary(
                p.Id,
                p.Name,
                p.Tasks.Count,
                p.Tasks.Count(t => !t.Done)))
            .ToListAsync();

        return TypedResults.Ok(summaries);
    }
}
