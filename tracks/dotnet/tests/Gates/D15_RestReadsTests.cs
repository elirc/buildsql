using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class D15_RestReadsTests
{
    [Fact]
    public async Task Ex1_TheCollectionSortsAndTheItemCanBeMissing()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var all = await client.GetAsync("/d15/stations");
        await Teach.Status(HttpStatusCode.OK, all,
            "GET /d15/stations must answer 200 - reread README ex1.");

        var cards = await all.Content.ReadFromJsonAsync<List<StationDto>>();
        Teach.Equal("cw01,cw07,ep03,hs11,vg02", string.Join(",", (cards ?? []).Select(c => c.Code)),
            "Code A-Z. The seeded order is hs11,cw07,vg02,cw01,ep03 - it is storage order, "
                + "and storage order is never a contract.");
        Teach.Equal("2,3,2,0,1", string.Join(",", (cards ?? []).Select(c => c.Available)),
            "Each card carries how many bikes are AVAILABLE there: cw01 has three docked "
                + "but one is in service, so it reports 2. A 0 everywhere means you "
                + "serialized Station, which has no such field.");
        Teach.Equal("Cathedral Wharf", cards?[0].Name, "...and the name comes along.");

        var one = await client.GetAsync("/d15/stations/cw07");
        await Teach.Status(HttpStatusCode.OK, one, "cw07 exists, so 200.");
        var card = await one.Content.ReadFromJsonAsync<StationDto>();
        Teach.Equal("Canal Works", card?.Name, "...and it is Canal Works.");
        Teach.Equal(3, card?.Available, "...with three available bikes.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d15/stations/zz99"),
            "There is no station zz99. That is a 404 - a deliberate answer. A 500 means "
                + "something threw: First throws on no match, FirstOrDefault does not.");
    }

    [Fact]
    public async Task Ex2_AnEmptyDockIsNotAMissingStation()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var busy = await client.GetAsync("/d15/stations/cw01/bikes");
        await Teach.Status(HttpStatusCode.OK, busy,
            "GET /d15/stations/cw01/bikes must answer 200 - reread README ex2.");

        var bikes = await busy.Content.ReadFromJsonAsync<List<BikeDto>>();
        Teach.Equal("1,2,3", string.Join(",", (bikes ?? []).Select(b => b.Id)),
            "Three bikes are docked at cw01, id ascending. The one in service is docked "
                + "too - it is standing at the station, it is just not rentable.");
        Teach.Equal("available,available,service", string.Join(",", (bikes ?? []).Select(b => b.Status)),
            "...and each one reports its own status.");

        var quiet = await client.GetAsync("/d15/stations/hs11/bikes");
        await Teach.Status(HttpStatusCode.OK, quiet,
            "hs11 exists and happens to be empty. The collection is there; it has nothing "
                + "in it. That is 200 and [], not 404.");
        Teach.Equal("", string.Join(",",
            (await quiet.Content.ReadFromJsonAsync<List<BikeDto>>() ?? []).Select(b => b.Id)),
            "...with nothing in it.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d15/stations/zz99/bikes"),
            "zz99 names no station, so the sub-resource does not exist either: 404. This is "
                + "the case the empty list above is NOT, and a client that cannot tell them "
                + "apart shows an empty dock for a station you deleted last week.");
    }

    [Fact]
    public async Task Ex3_AnUnknownFilterValueIsAClientError()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var all = await client.GetAsync("/d15/bikes");
        await Teach.Status(HttpStatusCode.OK, all,
            "GET /d15/bikes with no filter must answer 200 with the whole fleet - reread "
                + "README ex3.");
        Teach.Equal(12, (await all.Content.ReadFromJsonAsync<List<BikeDto>>())?.Count,
            "Twelve bikes exist and no filter was asked for.");

        var free = await client.GetFromJsonAsync<List<BikeDto>>("/d15/bikes?status=available");
        Teach.Equal("1,2,5,6,9,10,11,12", string.Join(",", (free ?? []).Select(b => b.Id)),
            "Eight bikes are available, id ascending.");

        var retired = await client.GetAsync("/d15/bikes?status=retired");
        await Teach.Status(HttpStatusCode.OK, retired,
            "\"retired\" is a legal status that nothing currently is. A legal question with "
                + "no answers is 200 and an empty array.");
        Teach.Equal(0, (await retired.Content.ReadFromJsonAsync<List<BikeDto>>())?.Count,
            "...and the array is empty.");

        var typo = await client.GetAsync("/d15/bikes?status=availble");
        await Teach.Status(HttpStatusCode.BadRequest, typo,
            "\"availble\" is not a status at all. Answering 200 with an empty array makes a "
                + "client typo indistinguishable from an empty fleet, and the caller debugs "
                + "the wrong system for an hour. Reject it.");
        var problem = await typo.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(problem?.Errors is not null && problem.Errors.ContainsKey("status"),
            "...as a validation problem whose errors dictionary is keyed \"status\", so the "
                + "client is told WHICH parameter it got wrong.");
    }

    [Fact]
    public async Task Ex4_RoutingDecidesWhichUrlMeansWhat()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var available = await client.GetAsync("/d15/bikes/available");
        await Teach.Status(HttpStatusCode.OK, available,
            "GET /d15/bikes/available is a resource of its own, not a malformed bike id. A "
                + "400 here means one catch-all route is still trying to parse it - reread "
                + "README ex4.");
        Teach.Equal("1,2,5,6,9,10,11,12", string.Join(",",
            (await available.Content.ReadFromJsonAsync<List<BikeDto>>() ?? []).Select(b => b.Id)),
            "...and it lists the eight available bikes, id ascending.");

        var one = await client.GetAsync("/d15/bikes/5");
        await Teach.Status(HttpStatusCode.OK, one, "Bike 5 exists.");
        Teach.Equal("cruiser", (await one.Content.ReadFromJsonAsync<BikeDto>())?.Model,
            "...and it is a cruiser.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d15/bikes/99"),
            "Bike 99 does not exist: 404.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d15/bikes/abc"),
            "\"abc\" cannot be a bike id, so no endpoint matches and routing answers 404 "
                + "before any handler runs. A 400 means your handler ran and parsed - which "
                + "works, until the day another route needs /d15/bikes/abc.");
    }

    [Fact]
    public async Task Ex5_AConditionalGetSavesTheBody()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d15/network");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d15/network must answer 200 - reread README ex5.");

        var summary = await first.Content.ReadFromJsonAsync<SummaryDto>();
        Teach.Equal(5, summary?.Stations, "Five stations.");
        Teach.Equal(12, summary?.Bikes, "Twelve bikes.");
        Teach.Equal(8, summary?.Available, "Eight of them available.");

        string? tag = first.Headers.ETag?.ToString();
        Teach.True(!string.IsNullOrEmpty(tag),
            "No ETag came back, so no client can ever ask whether it already has this. Use "
                + "the given Tag(...) helper and set Response.Headers.ETag.");
        Teach.True(tag!.StartsWith('"') && tag.EndsWith('"'),
            $"An entity tag is a quoted string; this one is {tag}. Unquoted, it is not a "
                + "valid ETag and HttpClient will not parse it.");

        var repeat = new HttpRequestMessage(HttpMethod.Get, "/d15/network");
        repeat.Headers.TryAddWithoutValidation("If-None-Match", tag);
        var second = await client.SendAsync(repeat);
        await Teach.Status(HttpStatusCode.NotModified, second,
            "The client sent back the exact tag it was given, so the representation it "
                + "holds is still current: 304, and the whole point is that the body is "
                + "never written.");
        Teach.Equal(0, (await second.Content.ReadAsByteArrayAsync()).Length,
            "...and a 304 carries no body at all.");
        Teach.Equal(tag, second.Headers.ETag?.ToString(),
            "...but it still carries the ETag, or the client has nothing to send next time.");

        var stale = new HttpRequestMessage(HttpMethod.Get, "/d15/network");
        stale.Headers.TryAddWithoutValidation("If-None-Match", "\"0000000000000000\"");
        await Teach.Status(HttpStatusCode.OK, await client.SendAsync(stale),
            "A tag that does NOT match means the client's copy is stale, so it gets the "
                + "full 200. Answering 304 to any If-None-Match at all is a cache that "
                + "never updates.");
    }

    [Fact]
    public async Task Ex6_OneQueryKeyCanCarryManyValues()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var all = await client.GetAsync("/d15/stations/search");
        await Teach.Status(HttpStatusCode.OK, all,
            "GET /d15/stations/search with no zone must answer 200 with every station - "
                + "reread README ex6.");
        Teach.Equal("cw01,cw07,ep03,hs11,vg02", string.Join(",",
            (await all.Content.ReadFromJsonAsync<List<StationDto>>() ?? []).Select(s => s.Code)),
            "All five, code A-Z.");

        var north = await client.GetFromJsonAsync<List<StationDto>>("/d15/stations/search?zone=north");
        Teach.Equal("cw07,ep03", string.Join(",", (north ?? []).Select(s => s.Code)),
            "Two stations are in the north zone.");

        var two = await client.GetFromJsonAsync<List<StationDto>>(
            "/d15/stations/search?zone=north&zone=south");
        Teach.Equal("cw07,ep03,vg02", string.Join(",", (two ?? []).Select(s => s.Code)),
            "zone= was sent twice, so a station matches EITHER value. Only cw07 and ep03 "
                + "means the second value was dropped: binding to one string keeps the "
                + "first and throws the rest away.");

        var shouty = await client.GetFromJsonAsync<List<StationDto>>("/d15/stations/search?zone=NORTH");
        Teach.Equal("cw07,ep03", string.Join(",", (shouty ?? []).Select(s => s.Code)),
            "Zone names are matched case-insensitively, so NORTH finds the north zone.");

        var nowhere = await client.GetAsync("/d15/stations/search?zone=orbital");
        await Teach.Status(HttpStatusCode.OK, nowhere,
            "A zone nobody is in is still a legal question: 200 and an empty array.");
        Teach.Equal(0, (await nowhere.Content.ReadFromJsonAsync<List<StationDto>>())?.Count,
            "...with nothing in it.");
    }

    [Fact]
    public async Task Ex7_TheClientChoosesTheRepresentation()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var plain = await client.GetAsync("/d15/export");
        await Teach.Status(HttpStatusCode.OK, plain,
            "GET /d15/export with no Accept header must still answer - JSON is the default "
                + "- reread README ex7.");
        Teach.Equal("application/json", plain.Content.Headers.ContentType?.MediaType,
            "No preference means the server picks, and it picks JSON.");
        Teach.Equal(5, (await plain.Content.ReadFromJsonAsync<List<StationDto>>())?.Count,
            "...with all five stations in it.");

        Teach.Equal("application/json",
            (await Accepting(client, "*/*")).Content.Headers.ContentType?.MediaType,
            "*/* means \"anything you like\", which is also JSON.");
        Teach.Equal("application/json",
            (await Accepting(client, "application/json")).Content.Headers.ContentType?.MediaType,
            "...and an explicit application/json, obviously.");

        var csv = await Accepting(client, "text/csv");
        await Teach.Status(HttpStatusCode.OK, csv,
            "text/csv is a representation this resource can produce, so it is a 200 - not a "
                + "406.");
        Teach.Equal("text/csv", csv.Content.Headers.ContentType?.MediaType,
            "...and the Content-Type has to say so, or the client cannot parse what it got.");
        Teach.Equal(
            "code,name,zone,capacity,available\n"
                + "cw01,Cathedral Wharf,central,20,2\n"
                + "cw07,Canal Works,north,12,3\n"
                + "ep03,Elm Park,north,30,2\n"
                + "hs11,Harbour Steps,central,16,0\n"
                + "vg02,Vale Gardens,south,8,1",
            (await csv.Content.ReadAsStringAsync()).Replace("\r\n", "\n").TrimEnd('\n'),
            "Header row, then one row per station in code order, comma separated.");

        var xml = await Accepting(client, "application/xml");
        await Teach.Status(HttpStatusCode.NotAcceptable, xml,
            "The client asked for the ONE thing this resource cannot produce. 406 says "
                + "that; sending JSON anyway sends bytes the client has already told you it "
                + "will not understand.");
    }

    [Fact]
    public async Task Ex8_OneEndpointWithTheWholeReadContract()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.NotFound,
            await client.GetAsync("/d15/stations/zz99/report"),
            "No station zz99, so no report: 404 - reread README ex8.");

        var bad = await client.GetAsync("/d15/stations/cw01/report?model=tandem");
        await Teach.Status(HttpStatusCode.BadRequest, bad,
            "The station exists but \"tandem\" is not a model. The 404 and the 400 are "
                + "different failures and must not be collapsed into one.");
        var problem = await bad.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(problem?.Errors is not null && problem.Errors.ContainsKey("model"),
            "...reported as a validation problem keyed \"model\".");

        var full = await client.GetAsync("/d15/stations/cw01/report");
        await Teach.Status(HttpStatusCode.OK, full, "cw01 with no filter: 200.");
        var report = await full.Content.ReadFromJsonAsync<ReportDto>();
        Teach.Equal("Cathedral Wharf", report?.Name, "cw01 is Cathedral Wharf.");
        Teach.Equal(20, report?.Capacity, "...with twenty docks.");
        Teach.Equal(3, report?.Docked, "Three bikes are docked there.");
        Teach.Equal(2, report?.Available, "Two of the three are available; one is in service.");
        Teach.Equal(17, report?.Free, "free is capacity minus docked: 20 - 3 = 17.");
        Teach.Equal("cargo,roadster", string.Join(",", report?.Models ?? []),
            "The DISTINCT models docked there, A-Z. \"roadster,roadster,cargo\" means the "
                + "duplicates were never collapsed.");

        string? tag = full.Headers.ETag?.ToString();
        Teach.True(!string.IsNullOrEmpty(tag), "This representation needs an ETag too.");

        var again = new HttpRequestMessage(HttpMethod.Get, "/d15/stations/cw01/report");
        again.Headers.TryAddWithoutValidation("If-None-Match", tag);
        await Teach.Status(HttpStatusCode.NotModified, await client.SendAsync(again),
            "Same URL, same tag, nothing changed: 304.");

        var narrowed = await client.GetAsync("/d15/stations/cw01/report?model=roadster");
        await Teach.Status(HttpStatusCode.OK, narrowed, "Filtered by model: 200.");
        var only = await narrowed.Content.ReadFromJsonAsync<ReportDto>();
        Teach.Equal(2, only?.Docked, "Two roadsters are docked at cw01.");
        Teach.Equal(2, only?.Available, "...and both are available.");
        Teach.Equal(18, only?.Free, "free follows the filtered count: 20 - 2 = 18.");
        Teach.Equal("roadster", string.Join(",", only?.Models ?? []), "One model survives the filter.");
        Teach.True(narrowed.Headers.ETag?.ToString() != tag,
            "A different query string produced a different body, so it must not carry the "
                + "same ETag - an entity tag identifies a REPRESENTATION, not a URL path. "
                + "Reusing one here is how a client caches the filtered answer as the "
                + "unfiltered one.");

        var empty = await client.GetFromJsonAsync<ReportDto>("/d15/stations/hs11/report");
        Teach.Equal(0, empty?.Docked, "Nothing is docked at hs11.");
        Teach.Equal(16, empty?.Free, "...so all sixteen docks are free.");
        Teach.Equal("", string.Join(",", empty?.Models ?? []), "...and no models are present.");
    }

    // ... private helpers and DTO records, listed below ...

    private static Task<HttpResponseMessage> Accepting(HttpClient client, string mediaType)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/d15/export");
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue(mediaType));
        return client.SendAsync(request);
    }

    private sealed record StationDto(string? Code, string? Name, string? Zone, int Capacity, int Available);

    private sealed record BikeDto(int Id, string? Model, string? Status, string? StationCode);

    private sealed record SummaryDto(int Stations, int Bikes, int Available);

    private sealed record ValidationDto(Dictionary<string, string[]>? Errors);

    private sealed record ReportDto(
        string? Code,
        string? Name,
        int Capacity,
        int Docked,
        int Available,
        int Free,
        List<string>? Models);
}
