// i3_interview_rapidfire / ex3 - tracking, cold.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 3".

using DotnetDojo.Api.I1_InterviewConcepts;

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public record CompleteResult(int Changes, bool Done);

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i3/tasks/{id:int}/complete", Complete);
    }

    // Load the task - tracked when `tracked` is true, with AsNoTracking when it
    // is false - set Done to true, and save.
    //
    // 200 with {"changes": <what SaveChangesAsync returned>, "done": <the flag
    // on the object you loaded>}, or 404 when there is no such task.
    private static Task<IResult> Complete(int id, bool tracked, TrackerDb db) =>
        throw new NotImplementedException("ex3: POST /i3/tasks/{id}/complete is not implemented yet - edit src/Api/I3_InterviewRapidfire/Ex3.cs");
}
