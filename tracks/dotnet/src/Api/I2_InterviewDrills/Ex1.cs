// i2_interview_drills / ex1 - "build me a search endpoint." Time-box: 20 minutes.
// See lessons/i2_interview_drills/README.md, "Drill 1".

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i2/books", Search);
    }

    // 200 with one page of books and an X-Total-Count header holding the number
    // of matches. author filters (case-insensitive, exact); sort is "title"
    // (default) or "year"; page is 1-based and defaults to 1; size defaults to
    // 3 and may not exceed 20. Anything else is a 400 validation problem keyed
    // by the offending parameter.
    private static IResult Search(
        string? author, string? sort, int? page, int? size, HttpResponse response) =>
        throw new NotImplementedException("ex1: GET /i2/books is not implemented yet - edit src/Api/I2_InterviewDrills/Ex1.cs");
}
