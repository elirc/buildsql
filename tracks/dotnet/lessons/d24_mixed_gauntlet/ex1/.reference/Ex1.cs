// d24_mixed_gauntlet / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // A literal segment outranks a parameter segment, so the order of
        // these two lines does not matter - and the :int constraint is what
        // makes /d24/exhibits/abc match nothing and answer 404 from routing,
        // before any handler of ours runs.
        app.MapGet("/d24/exhibits/open", Open);
        app.MapGet("/d24/exhibits/{id:int}", One);
    }

    private static async Task<IResult> Open(D24Db db) =>
        TypedResults.Ok(await db.Exhibits
            .Where(e => e.Capacity > 0)
            .OrderBy(e => e.Name)
            .Select(e => new ExhibitDto(e.Id, e.Name, e.Gallery, e.Capacity))
            .ToListAsync());

    private static async Task<IResult> One(int id, D24Db db)
    {
        // FirstOrDefault, not First: "no such exhibit" is a decision this
        // handler makes, not an exception the pipeline reports as a 500.
        var exhibit = await db.Exhibits
            .Where(e => e.Id == id)
            .Select(e => new ExhibitDto(e.Id, e.Name, e.Gallery, e.Capacity))
            .FirstOrDefaultAsync();

        return exhibit is null ? TypedResults.NotFound() : TypedResults.Ok(exhibit);
    }
}
