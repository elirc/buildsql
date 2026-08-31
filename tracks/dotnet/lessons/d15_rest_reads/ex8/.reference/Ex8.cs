// d15_rest_reads / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D15_RestReads;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/stations/{code}/report", Report);
    }

    private static IResult Report(string code, string? model, HttpContext http)
    {
        // Order matters: the resource has to exist before its query string can
        // be wrong about anything.
        var station = D15Network.Find(code);
        if (station is null)
        {
            return TypedResults.NotFound();
        }

        if (model is not null && !D15Network.Models.Contains(model))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["model"] = [$"'{model}' is not a bike model. Try one of: "
                    + string.Join(", ", D15Network.Models) + "."],
            });
        }

        var docked = D15Network.Bikes
            .Where(b => b.StationCode == code && (model is null || b.Model == model))
            .ToList();

        var report = new StationReport(
            station.Code,
            station.Name,
            station.Capacity,
            docked.Count,
            docked.Count(b => b.Status == "available"),
            station.Capacity - docked.Count,
            docked.Select(b => b.Model)
                .Distinct()
                .OrderBy(m => m, StringComparer.Ordinal)
                .ToList());

        // The tag is computed from the report that was actually produced, so
        // ?model=roadster and the unfiltered call cannot collide.
        string tag = Ex5.Tag(report);
        http.Response.Headers.ETag = tag;

        if (http.Request.Headers.IfNoneMatch.Any(value => value == tag))
        {
            return TypedResults.StatusCode(StatusCodes.Status304NotModified);
        }

        return TypedResults.Ok(report);
    }
}
