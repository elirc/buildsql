// d14_projections_dtos / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/search", Search);
    }

    private static async Task<IResult> Search(string? q, D14Db db)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["q"] = ["Provide a search term."],
            });
        }

        string pattern = $"%{q.Trim()}%";

        // Two sources, two queries, one wire shape. LIKE in SQLite is
        // case-insensitive for ASCII, so no ToLower is needed - and ToLower
        // would defeat an index on a real database anyway.
        var films = await db.Films
            .Where(f => EF.Functions.Like(f.Title, pattern))
            .OrderBy(f => f.Title)
            .Select(f => new SearchHit("film", f.Title, (int?)f.Year))
            .ToListAsync();

        var directors = await db.Directors
            .Where(d => EF.Functions.Like(d.Name, pattern))
            .OrderBy(d => d.Name)
            .Select(d => new SearchHit("director", d.Name, null))
            .ToListAsync();

        return TypedResults.Ok(films.Concat(directors).ToList());
    }
}
