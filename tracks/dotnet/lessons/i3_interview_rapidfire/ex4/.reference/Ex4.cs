// i3_interview_rapidfire / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i3/codes", CreateCode);
        app.MapDelete("/i3/codes/{id:int}", DeleteCode);
    }

    private static IResult CreateCode(NewCode request, ICodeStore store)
    {
        if (string.IsNullOrWhiteSpace(request.Value))
        {
            return TypedResults.BadRequest();
        }

        if (store.Exists(request.Value))
        {
            return TypedResults.Conflict();
        }

        var code = store.Add(request.Value);
        return TypedResults.Created($"/i3/codes/{code.Id}", code);
    }

    private static IResult DeleteCode(int id, ICodeStore store) =>
        store.Remove(id) ? TypedResults.NoContent() : TypedResults.NotFound();
}
