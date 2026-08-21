using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;

namespace DotnetDojo.Gates;

public class L04_ConfigurationOptionsTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_CatalogOptionsComeFromAppsettings()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l04/catalog-options");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l04/catalog-options must answer 200 - reread README ex1.");

        var body = await response.Content.ReadFromJsonAsync<CatalogDto>();
        Teach.Equal("Dojo Catalog", body?.Title,
            "Title comes from Dojo:Catalog:Title in appsettings.json. An empty string means "
                + "nothing was bound - check the section path you passed to GetSection.");
        Teach.Equal(25, body?.PageSize,
            "PageSize is 25 in appsettings.json, and it is written there as a number, which "
                + "the binder converts to an int for you.");
        Teach.Equal("EUR", body?.Currency,
            "Currency is EUR. If Title bound and this did not, the property name does not "
                + "match the key.");
    }

    [Fact]
    public async Task Ex2_APartialSectionLeavesTheDefaultsAlone()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l04/report-options");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l04/report-options must answer 200 - reread README ex2.");

        var body = await response.Content.ReadFromJsonAsync<ReportDto>();
        Teach.Equal(500, body?.MaxRows,
            "Dojo:Reports sets MaxRows to 500, so the configured value must win over your "
                + "default of 100.");
        Teach.Equal("csv", body?.Format,
            "Dojo:Reports says nothing about Format, so your default has to survive. The "
                + "binder only writes properties it finds keys for; it does not blank the "
                + "rest.");
        Teach.Equal(true, body?.IncludeHeaders,
            "IncludeHeaders is not in configuration either, and its default is true. A false "
                + "here means you left it as the type's default rather than setting one.");
    }

    [Fact]
    public async Task Ex3_TheAppKnowsWhichEnvironmentItIsRunningIn()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l04/environment");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l04/environment must answer 200 - reread README ex3.");

        var body = await response.Content.ReadFromJsonAsync<EnvironmentDto>();
        Teach.Equal("Development", body?.Name,
            "The gate boots the app in the Development environment, so IHostEnvironment "
                + "reports \"Development\".");
        Teach.Equal(true, body?.IsDevelopment,
            "IHostEnvironment has a method that answers this question - do not compare the "
                + "name to a string literal yourself.");
        Teach.Equal("Dojo Catalog", body?.CatalogTitle,
            "Read Dojo:Catalog:Title straight out of IConfiguration with the colon-separated "
                + "key. Configuration is a flat dictionary of paths, not a tree of objects.");

        using var staging = factory.WithWebHostBuilder(builder => builder.UseEnvironment("Staging"));
        using var stagingClient = staging.CreateClient();

        var stagingBody = await stagingClient.GetFromJsonAsync<EnvironmentDto>("/l04/environment");
        Teach.Equal("Staging", stagingBody?.Name,
            "The same code, booted with a different environment name, must report that name. "
                + "A hard-coded \"Development\" passes the first check and fails here.");
        Teach.Equal(false, stagingBody?.IsDevelopment,
            "Staging is not Development, so IsDevelopment() is false.");
    }

    [Fact]
    public async Task Challenge_EachFeedGetsItsOwnNamedOptions()
    {
        using var client = factory.CreateClient();

        var primary = await client.GetAsync("/l04/feeds/primary");
        await Teach.Status(HttpStatusCode.OK, primary,
            "GET /l04/feeds/primary must answer 200 - reread README challenge.");
        var primaryBody = await primary.Content.ReadFromJsonAsync<FeedDto>();
        Teach.Equal("https://primary.example/feed", primaryBody?.Url,
            "The \"primary\" name has to select the Dojo:Feeds:primary section.");
        Teach.Equal(5, primaryBody?.TimeoutSeconds,
            "primary's timeout is 5 seconds.");

        var fallback = await client.GetFromJsonAsync<FeedDto>("/l04/feeds/fallback");
        Teach.Equal("https://fallback.example/feed", fallback?.Url,
            "…and \"fallback\" has to select a different section. Two names, two option "
                + "instances, one options class.");
        Teach.Equal(30, fallback?.TimeoutSeconds,
            "fallback's timeout is 30 seconds. Getting 5 here means both names resolve to "
                + "the same registration.");

        var unknown = await client.GetAsync("/l04/feeds/nope");
        await Teach.Status(HttpStatusCode.NotFound, unknown,
            "There is no Dojo:Feeds:nope section. IOptionsMonitor.Get(\"nope\") happily "
                + "returns an unbound object with default values, so the endpoint has to ask "
                + "configuration whether the name exists before trusting it.");
    }

    [Fact]
    public async Task Review1_MailerOptionsBindAndDefault()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l04/review/mailer");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l04/review/mailer must answer 200 - reread README review.");

        var body = await response.Content.ReadFromJsonAsync<MailerDto>();
        Teach.Equal("dojo@example.com", body?.FromAddress,
            "Dojo:Mailer:FromAddress is the one value configuration supplies.");
        Teach.Equal("Dojo", body?.DisplayName,
            "DisplayName is not configured, so your default of \"Dojo\" has to show up.");
        Teach.Equal(3, body?.RetryCount,
            "RetryCount is not configured either; its default is 3, not 0.");
    }

    private sealed record CatalogDto(string? Title, int PageSize, string? Currency);

    private sealed record ReportDto(int MaxRows, string? Format, bool IncludeHeaders);

    private sealed record EnvironmentDto(string? Name, bool IsDevelopment, string? CatalogTitle);

    private sealed record FeedDto(string? Name, string? Url, int TimeoutSeconds);

    private sealed record MailerDto(string? FromAddress, string? DisplayName, int RetryCount);
}
