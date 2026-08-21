// i1_interview_concepts / ex3 - "this endpoint is slow in production. Find out why."
// See lessons/i1_interview_concepts/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.I1_InterviewConcepts;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i1/projects/summary", Summary);
    }

    // The output is correct. The number of round trips is not.
    private static async Task<IResult> Summary(TrackerDb db)
    {
        var projects = await db.Projects.OrderBy(p => p.Id).ToListAsync();
        var summaries = new List<ProjectSummary>();

        foreach (var project in projects)
        {
            int total = await db.Tasks.CountAsync(t => t.ProjectId == project.Id);
            int open = await db.Tasks.CountAsync(t => t.ProjectId == project.Id && !t.Done);
            summaries.Add(new ProjectSummary(project.Id, project.Name, total, open));
        }

        return TypedResults.Ok(summaries);
    }
}
