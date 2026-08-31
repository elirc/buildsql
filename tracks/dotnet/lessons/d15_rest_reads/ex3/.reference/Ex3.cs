// d15_rest_reads / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D15_RestReads;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/bikes", List);
    }

    private static IResult List(string? status)
    {
        // Validate the value against the vocabulary BEFORE filtering with it.
        // Absent is legal; present-and-unknown is not.
        if (status is not null && !D15Network.Statuses.Contains(status))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["status"] = [$"'{status}' is not a bike status. Try one of: "
                    + string.Join(", ", D15Network.Statuses) + "."],
            });
        }

        return TypedResults.Ok(D15Network.Bikes
            .Where(b => status is null || b.Status == status)
            .OrderBy(b => b.Id)
            .Select(b => new BikeCard(b.Id, b.Model, b.Status, b.StationCode))
            .ToList());
    }
}
