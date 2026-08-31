// d15_rest_reads / ex5 - a conditional GET.
// See lessons/d15_rest_reads/README.md, "Exercise 5".

namespace DotnetDojo.Api.D15_RestReads;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/network", Summary);
    }

    // 200 with a NetworkSummary and an ETag header identifying that body. When
    // the request carries an If-None-Match that matches, answer 304 with no
    // body - and still send the ETag.
    private static IResult Summary(HttpContext http)
    {
        var summary = new NetworkSummary(
            D15Network.Stations.Count,
            D15Network.Bikes.Count,
            D15Network.Bikes.Count(b => b.Status == "available"));

        // TODO ex5: no ETag goes out, so no client can ever ask "is it still
        // the same?" - and the If-None-Match it does send is ignored.
        return TypedResults.Ok(summary);
    }

    /// <summary>Given: a stable, quoted entity tag for any body. Use it, do not edit it.</summary>
    public static string Tag(object body)
    {
        string json = System.Text.Json.JsonSerializer.Serialize(body);
        byte[] hash = System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(json));
        return "\"" + Convert.ToHexString(hash)[..16] + "\"";
    }
}
