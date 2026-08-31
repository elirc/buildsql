// d24_mixed_gauntlet / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d24/galleries", Galleries);
    }

    private static async Task<IResult> Galleries(D24Db db)
    {
        // Two grouped queries, both aggregated by the database. The loop this
        // replaces asked the database once per exhibit; the cost of that grows
        // with the data and is invisible in the response body.
        var exhibits = await db.Exhibits
            .GroupBy(e => e.Gallery)
            .Select(g => new { Gallery = g.Key, Count = g.Count() })
            .ToListAsync();

        // Cancelled tickets are filtered in the QUERY, so they never travel
        // and never get counted by accident.
        var sold = await db.Tickets
            .Where(t => !t.Cancelled)
            .GroupBy(t => t.Exhibit!.Gallery)
            .Select(g => new { Gallery = g.Key, Count = g.Count() })
            .ToListAsync();

        var soldByGallery = sold.ToDictionary(x => x.Gallery, x => x.Count);

        return TypedResults.Ok(exhibits
            .OrderBy(x => x.Gallery, StringComparer.Ordinal)
            .Select(x => new GalleryRow(
                x.Gallery,
                x.Count,
                soldByGallery.TryGetValue(x.Gallery, out int n) ? n : 0))
            .ToList());
    }
}
