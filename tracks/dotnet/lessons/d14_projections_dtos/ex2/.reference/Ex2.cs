// d14_projections_dtos / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/directors/{id:int}", Detail);
    }

    private static async Task<IResult> Detail(int id, D14Db db)
    {
        // The nested Select lives INSIDE the outer one, so EF issues a single
        // query and materialises the titles into the DTO's list for us.
        var detail = await db.Directors
            .Where(d => d.Id == id)
            .Select(d => new DirectorFilms(
                d.Name,
                d.Films.OrderBy(f => f.Year).Select(f => f.Title).ToList()))
            .FirstOrDefaultAsync();

        return detail is null ? TypedResults.NotFound() : TypedResults.Ok(detail);
    }
}
