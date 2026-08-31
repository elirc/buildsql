using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class D05_DiPatternsTests
{
    [Fact]
    public async Task Ex1_EveryImplementationIsRegisteredAndOneIsChosen()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var sms = await client.GetAsync("/d05/notify/sms?message=hi");
        await Teach.Status(HttpStatusCode.OK, sms,
            "GET /d05/notify/sms must answer 200. A 404 means IEnumerable<INotifier> never "
                + "contained an SMS notifier - reread README ex1.");

        var body = await sms.Content.ReadFromJsonAsync<NotifyDto>();
        Teach.Equal("sms:hi", body?.Sent,
            "The channel in the route picks which implementation does the work.");
        Teach.Equal("email,push,sms", Join(body?.Channels),
            "Every registration for INotifier shows up in the enumerable, sorted A-Z. One "
                + "name here means later Add calls replaced the earlier ones - they do not.");

        var email = await client.GetFromJsonAsync<NotifyDto>("/d05/notify/email?message=yo");
        Teach.Equal("email:yo", email?.Sent, "…and a different channel picks a different one.");

        var fax = await client.GetAsync("/d05/notify/fax");
        await Teach.Status(HttpStatusCode.NotFound, fax,
            "Nobody implements fax, so there is no such channel: 404 rather than a 500 from "
                + "First on an empty sequence.");
    }

    [Fact]
    public async Task Ex2_TheFactoryBuildsTheServiceFromAnotherService()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d05/price?units=4");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d05/price?units=4 must answer 200 - reread README ex2.");

        var body = await response.Content.ReadFromJsonAsync<PriceDto>();
        Teach.Equal(1000, body?.Quote,
            "The rate is 250 and the order is 4 units. A 0 means the pricer was built with a "
                + "literal instead of with the rate the container is holding - the whole "
                + "reason to register a factory is that the constructor needs a VALUE, not a "
                + "service.");

        var single = await client.GetFromJsonAsync<PriceDto>("/d05/price");
        Teach.Equal(250, single?.Quote, "One unit is one rate.");

        var silly = await client.GetAsync("/d05/price?units=0");
        await Teach.Status(HttpStatusCode.BadRequest, silly, "Zero units is a 400.");
    }

    [Fact]
    public async Task Ex3_TheDecoratorsWrapInTheOrderYouComposeThem()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d05/sink?message=hi");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d05/sink must answer 200 - reread README ex3.");

        var body = await response.Content.ReadFromJsonAsync<SinkDto>();
        Teach.Equal("audit[core(HI)]", body?.Result,
            "Audit on the outside, uppercase in the middle, core at the centre. \"core(hi)\" "
                + "means nothing is wrapping anything; \"audit[core(hi)]\" means the uppercase "
                + "layer is missing; \"core(AUDIT…)\" means they are inside out.");

        Teach.Equal("hi", Join(body?.Audited),
            "The audit layer records what IT was given, which is the original message - it "
                + "sits outside the uppercase layer, so it never sees the shouted version.");
    }

    [Fact]
    public async Task Ex4_OneOpenGenericRegistrationCoversEveryClosedForm()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d05/repos");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d05/repos must answer 200. A 500 saying IRepository<Gadget> cannot be "
                + "resolved means only the closed Widget form was registered - reread README "
                + "ex4.");

        var body = await response.Content.ReadFromJsonAsync<RepoDto>();
        Teach.Equal("Widget", body?.Widget, "IRepository<Widget> closes over Widget…");
        Teach.Equal("Gadget", body?.Gadget,
            "…and IRepository<Gadget> over Gadget, from the same single registration. The "
                + "container closes the open generic for whatever you ask for.");
        Teach.Equal(true, body?.SameInstance,
            "Two resolutions of the SAME closed form in one request must be one object. False "
                + "here means the registration is transient rather than scoped - each closed "
                + "form gets its own instance per scope, not per resolution.");
    }

    [Fact]
    public async Task Ex5_KeysSelectAmongImplementationsOfOneInterface()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var sms = await client.GetAsync("/d05/channels/sms");
        await Teach.Status(HttpStatusCode.OK, sms,
            "GET /d05/channels/sms must answer 200. A 500 about a keyed service means nothing "
                + "was registered under that key - reread README ex5.");

        var body = await sms.Content.ReadFromJsonAsync<ChannelDto>();
        Teach.Equal("email", body?.Primary,
            "The first parameter is pinned to the \"email\" key by an attribute, so it never "
                + "changes with the route.");
        Teach.Equal("sms", body?.Selected,
            "…while the selected one is resolved from the key in the route, at request time.");
        Teach.Equal("email,sms", Join(body?.All),
            "Both keyed registrations show up when you ask for any key.");

        var email = await client.GetFromJsonAsync<ChannelDto>("/d05/channels/email");
        Teach.Equal("email", email?.Selected, "The email key selects the email channel.");

        var fax = await client.GetAsync("/d05/channels/fax");
        await Teach.Status(HttpStatusCode.NotFound, fax,
            "No channel is registered under \"fax\": 404. Use the Get*Service form that "
                + "returns null rather than the GetRequired* one that throws.");
    }

    [Fact]
    public async Task Ex6_TryAddEnumerableRegistersASetWithoutDuplicating()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d05/checks");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d05/checks must answer 200 - reread README ex6.");

        var body = await response.Content.ReadFromJsonAsync<CheckDto>();
        Teach.Equal("disk,clock", Join(body?.Names),
            "Two checks, in registration order. \"disk,clock,disk\" means the third call "
                + "appended instead of noticing that implementation was already in the set - "
                + "which in a real application means running the same startup check twice.");
        Teach.Equal(2, body?.Count, "…so the count is 2, not 3.");
    }

    [Fact]
    public async Task Ex7_HalfTheConstructorComesFromTheContainer()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d05/jobs/nightly");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d05/jobs/nightly must answer 200 - reread README ex7.");

        var body = await response.Content.ReadFromJsonAsync<JobDto>();
        Teach.Equal("nightly@2026-01-01", body?.Describe,
            "The label came from the caller and the date came from the injected clock - one "
                + "object built out of both.");
        Teach.Equal(true, body?.ClockFromContainer,
            "…and the clock has to be the container's singleton, not a new one. False here "
                + "means the job was built with `new`, which works right up until the clock "
                + "has dependencies of its own.");

        var other = await client.GetFromJsonAsync<JobDto>("/d05/jobs/weekly");
        Teach.Equal("weekly@2026-01-01", other?.Describe,
            "A second call with a different label reuses the same clock.");
    }

    [Fact]
    public async Task Ex8_ARegistrationYouDidNotWriteCanStillBeWrapped()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d05/greet/ada");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d05/greet/ada must answer 200 - reread README ex8.");

        var a = await first.Content.ReadFromJsonAsync<GreetDto>();
        Teach.Equal("counting>shouting>core", a?.Chain,
            "Counting on the outside, shouting in the middle, and the ORIGINAL registration "
                + "still at the centre. \"core\" alone means nothing wrapped it; a chain "
                + "without \"core\" means the decoration replaced the implementation instead "
                + "of wrapping it.");
        Teach.Equal("HELLO ADA", a?.Greeting,
            "…and the answer went through both layers.");
        Teach.Equal(1, a?.Greeted, "The counting layer counted this greeting.");

        var b = await client.GetFromJsonAsync<GreetDto>("/d05/greet/grace");
        Teach.Equal("HELLO GRACE", b?.Greeting, "A second greeting, same chain…");
        Teach.Equal(2, b?.Greeted,
            "…and the counter climbs, which means one decorated singleton is serving both "
                + "requests rather than being rebuilt.");
    }

    // … private helpers and DTO records, listed below …

    private static string Join(IEnumerable<string>? values) => string.Join(",", values ?? []);

    private sealed record NotifyDto(string? Sent, List<string>? Channels);

    private sealed record PriceDto(int Units, int Quote);

    private sealed record SinkDto(string? Result, List<string>? Audited);

    private sealed record RepoDto(string? Widget, string? Gadget, bool SameInstance);

    private sealed record ChannelDto(string? Primary, string? Selected, List<string>? All);

    private sealed record CheckDto(List<string>? Names, int Count);

    private sealed record JobDto(string? Describe, bool ClockFromContainer);

    private sealed record GreetDto(string? Greeting, int Greeted, string? Chain);
}
