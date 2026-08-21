// i2_interview_drills / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i2/books", Search);
    }

    private static IResult Search(
        string? author, string? sort, int? page, int? size, HttpResponse response)
    {
        string order = sort ?? "title";
        int wanted = page ?? 1;
        int perPage = size ?? 3;

        var errors = new Dictionary<string, string[]>();

        if (order != "title" && order != "year")
        {
            errors["sort"] = ["sort must be 'title' or 'year'."];
        }

        if (wanted < 1)
        {
            errors["page"] = ["page is 1-based."];
        }

        if (perPage < 1 || perPage > 20)
        {
            errors["size"] = ["size must be between 1 and 20."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        var matches = Library.Books.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(author))
        {
            matches = matches.Where(b =>
                string.Equals(b.Author, author, StringComparison.OrdinalIgnoreCase));
        }

        var ordered = order == "year"
            ? matches.OrderBy(b => b.Year).ThenBy(b => b.Title, StringComparer.Ordinal)
            : matches.OrderBy(b => b.Title, StringComparer.Ordinal);

        var all = ordered.ToList();
        var items = all.Skip((wanted - 1) * perPage).Take(perPage).ToList();

        response.Headers["X-Total-Count"] = all.Count.ToString();
        return TypedResults.Ok(items);
    }
}
