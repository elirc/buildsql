// i3_interview_rapidfire / ex4 - status codes, cold.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 4".

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i3/codes", CreateCode);
        app.MapDelete("/i3/codes/{id:int}", DeleteCode);
    }

    // Blank value      -> 400
    // Value already in the store -> 409
    // Otherwise        -> 201, Location /i3/codes/{id}, the created code
    private static IResult CreateCode(NewCode request, ICodeStore store) =>
        throw new NotImplementedException("ex4: POST /i3/codes is not implemented yet - edit src/Api/I3_InterviewRapidfire/Ex4.cs");

    // 204 when it was there and is now gone, 404 when it was not.
    private static IResult DeleteCode(int id, ICodeStore store) =>
        throw new NotImplementedException("ex4: DELETE /i3/codes/{id} is not implemented yet - edit src/Api/I3_InterviewRapidfire/Ex4.cs");
}
