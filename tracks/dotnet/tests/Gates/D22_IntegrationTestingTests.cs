using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.D22_IntegrationTesting;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DotnetDojo.Gates;

public class D22_IntegrationTestingTests
{
    [Fact]
    public async Task Ex1_TwoHostsMustNotShareOneList()
    {
        using var first = new DojoWebFactory();
        using var second = new DojoWebFactory();
        using var alpha = first.CreateClient();
        using var beta = second.CreateClient();

        var placed = await alpha.PostAsJsonAsync("/d22/holds", new { code = "bk-101", cardId = "m-014" });
        await Teach.Status(HttpStatusCode.Created, placed,
            "POST /d22/holds must answer 201 - reread README ex1.");
        Teach.Equal("/d22/holds/1", placed.Headers.Location?.ToString(),
            "...with a Location naming the new hold. This host has placed exactly one hold in "
                + "its life, so that hold is number 1.");

        var hold = await placed.Content.ReadFromJsonAsync<HoldDto>();
        Teach.Equal(1, hold?.Id, "...and the body says the same id.");
        Teach.Equal("bk-101", hold?.Code, "...for the book that was asked for.");

        var other = await beta.PostAsJsonAsync("/d22/holds", new { code = "bk-107", cardId = "m-007" });
        await Teach.Status(HttpStatusCode.Created, other,
            "A second, completely independent host places its own single hold.");
        Teach.Equal(1, (await other.Content.ReadFromJsonAsync<HoldDto>())?.Id,
            "The second host called this the SECOND hold, so the counter is a static field: "
                + "there is one of it for the whole process and every host is sharing it.");

        var mine = await alpha.GetFromJsonAsync<List<HoldDto>>("/d22/holds");
        Teach.Equal("bk-101", string.Join(",", (mine ?? []).Select(h => h.Code)),
            "One POST ever reached this host, so it holds exactly one hold. Seeing bk-107 in "
                + "here means the other host's write leaked in through a static List - and "
                + "which test runs first would decide whether this passes.");

        var theirs = await beta.GetFromJsonAsync<List<HoldDto>>("/d22/holds");
        Teach.Equal("bk-107", string.Join(",", (theirs ?? []).Select(h => h.Code)),
            "...and the second host sees only its own. A singleton resolved from the container "
                + "gives you exactly this: one instance per host, and a gate is one host.");
    }

    [Fact]
    public async Task Ex2_TheHandlerMustBeToldWhatNowIs()
    {
        using var root = new DojoWebFactory();
        using var host = WithSeams(root, now: new DateTimeOffset(2026, 3, 4, 9, 30, 0, TimeSpan.Zero));
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d22/desk/due");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d22/desk/due must answer 200 - reread README ex2.");

        var due = await response.Content.ReadFromJsonAsync<DueDto>();
        Teach.Equal("2026-03-04T09:30:00Z", due?.IssuedAt,
            "This host's TimeProvider was replaced with one that always answers "
                + "2026-03-04T09:30:00Z. A stamp near the real date means the handler called "
                + "DateTimeOffset.UtcNow - a value nobody outside it can choose, and therefore "
                + "a value no test can ever assert.");
        Teach.Equal("2026-03-18T09:30:00Z", due?.DueAt,
            "...and fourteen days on from that instant is 2026-03-18T09:30:00Z.");
        Teach.Equal(14, due?.LoanDays, "D22Library.DefaultLoanDays is 14.");

        using var earlier = WithSeams(root, now: new DateTimeOffset(2019, 11, 7, 23, 45, 0, TimeSpan.Zero));
        using var earlierClient = earlier.CreateClient();

        var old = await earlierClient.GetFromJsonAsync<DueDto>("/d22/desk/due");
        Teach.Equal("2019-11-07T23:45:00Z", old?.IssuedAt,
            "A second host was given a different clock and must give a different answer. "
                + "Hard-coding the first instant passes the assertions above and fails here.");
        Teach.Equal("2019-11-21T23:45:00Z", old?.DueAt,
            "...and its due date follows its own clock, not the wall.");
    }

    [Fact]
    public async Task Ex3_TheSameRequestMustProduceTheSameReference()
    {
        using var first = new DojoWebFactory();
        using var alpha = first.CreateClient();

        var created = await alpha.PostAsJsonAsync("/d22/receipts", new { cardId = "m-014" });
        await Teach.Status(HttpStatusCode.Created, created,
            "POST /d22/receipts must answer 201 - reread README ex3.");

        var receipt = await created.Content.ReadFromJsonAsync<ReceiptDto>();
        Teach.Equal("LOAN-M-014-0001", receipt?.Reference,
            "LOAN-, the card id in capitals, then the sequence padded to four digits. A "
                + "36-character hyphenated blob means the reference came from Guid.NewGuid, "
                + "which no assertion in any test can ever match.");
        Teach.Equal(1, receipt?.Sequence, "The injected ReferenceDesk hands out 1 first.");
        Teach.Equal("/d22/receipts/LOAN-M-014-0001", created.Headers.Location?.ToString(),
            "...and the Location carries the same reference.");

        var next = await alpha.PostAsJsonAsync("/d22/receipts", new { cardId = "m-007" });
        var second = await next.Content.ReadFromJsonAsync<ReceiptDto>();
        Teach.Equal("LOAN-M-007-0002", second?.Reference,
            "The second receipt on this host takes the second number. Reproducible does not "
                + "mean constant - it means a function of the inputs.");
        Teach.Equal(2, second?.Sequence, "...which is 2.");

        using var fresh = new DojoWebFactory();
        using var beta = fresh.CreateClient();

        var again = await beta.PostAsJsonAsync("/d22/receipts", new { cardId = "m-014" });
        Teach.Equal("LOAN-M-014-0001", (await again.Content.ReadFromJsonAsync<ReceiptDto>())?.Reference,
            "A brand new host, the same request, the same answer. A 0003 here means the "
                + "sequence is a static counter shared with the host above, so this test "
                + "passes or fails depending on what ran before it.");
    }

    [Fact]
    public async Task Ex4_TheFakeMustBeTheThingThatGetsCalled()
    {
        using var root = new DojoWebFactory();
        var recorder = new RecordingNotifier();
        using var host = WithSeams(root, notifier: recorder);
        using var client = host.CreateClient();

        var response = await client.PostAsync("/d22/reminders", null);
        await Teach.Status(HttpStatusCode.OK, response,
            "POST /d22/reminders must answer 200 - reread README ex4.");
        Teach.Equal(3, (await response.Content.ReadFromJsonAsync<SweepDto>())?.Notified,
            "Three of the five seeded loans are overdue: 2, 4 and 5.");

        Teach.Equal("m-007|bk-102|3, m-021|bk-101|11, m-007|bk-109|1", recorder.Calls,
            "This host's IOverdueNotifier was replaced with a recorder, and this is what it "
                + "heard. An empty string means the handler built its own notifier with `new` "
                + "- the count above can be perfectly right while the endpoint talks to an "
                + "object no test can reach. A different order means the sweep did not go by "
                + "loan id.");

        var quiet = new RecordingNotifier();
        using var another = WithSeams(root, notifier: quiet);
        using var anotherClient = another.CreateClient();

        Teach.Equal(0, quiet.Count, "A fresh host's recorder has heard nothing yet.");
        await anotherClient.PostAsync("/d22/reminders", null);
        Teach.Equal(3, quiet.Count, "...and after one sweep it has heard three calls.");
        Teach.Equal(3, recorder.Count,
            "...while the first host's recorder is untouched. Each host got its own fake, "
                + "which is the whole reason two tests can assert on the same seam at once.");
    }

    [Fact]
    public async Task Ex5_ALimitATestCanChangeWithoutARebuild()
    {
        using var root = new DojoWebFactory();
        using var client = root.CreateClient();

        var response = await client.GetAsync("/d22/members/m-014/allowance");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d22/members/m-014/allowance must answer 200 - reread README ex5.");

        var ada = await response.Content.ReadFromJsonAsync<AllowanceDto>();
        Teach.Equal("Ada Okafor", ada?.Name, "m-014 is Ada Okafor.");
        Teach.Equal(2, ada?.OnLoan, "She holds loans 1 and 3.");
        Teach.Equal(3, ada?.MaxLoans,
            "Nothing was configured on this host, so LoanPolicyOptions keeps its default "
                + "MaxPerMember of 3.");
        Teach.Equal(true, ada?.CanBorrow, "...and 2 is fewer than 3.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.GetAsync("/d22/members/m-999/allowance"),
            "No member holds card m-999, so there is no allowance to report: 404.");

        using var strict = WithSeams(root, settings: new() { ["Dojo:D22:Loans:MaxPerMember"] = "2" });
        using var strictClient = strict.CreateClient();

        var tighter = await strictClient.GetFromJsonAsync<AllowanceDto>("/d22/members/m-014/allowance");
        Teach.Equal(2, tighter?.MaxLoans,
            "This host was booted with Dojo:D22:Loans:MaxPerMember set to 2. A 3 here means "
                + "the limit is a constant compiled into the handler, and the only way to try "
                + "a different policy is to edit the source and rebuild.");
        Teach.Equal(2, tighter?.OnLoan, "The loans did not change - only the policy did.");
        Teach.Equal(false, tighter?.CanBorrow,
            "...and 2 is not fewer than 2, so on THIS host Ada is at her limit.");

        var cleo = await strictClient.GetFromJsonAsync<AllowanceDto>("/d22/members/m-021/allowance");
        Teach.Equal(1, cleo?.OnLoan, "m-021 holds one loan...");
        Teach.Equal(true, cleo?.CanBorrow,
            "...so the same tightened limit still lets her borrow. The answer is a function of "
                + "the member AND the configuration, not of either one alone.");
    }

    [Fact]
    public async Task Ex6_ARetryIsNotASecondReturn()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.PostAsync("/d22/returns/5", null);
        await Teach.Status(HttpStatusCode.OK, first,
            "POST /d22/returns/5 must answer 200 - reread README ex6.");

        var one = await first.Content.ReadFromJsonAsync<ReturnDto>();
        Teach.Equal(false, one?.AlreadyReturned, "Loan 5 had not been shelved on this host before.");
        Teach.Equal(1, one?.ReturnedCount, "...so the log now holds one id.");

        var two = await (await client.PostAsync("/d22/returns/2", null))
            .Content.ReadFromJsonAsync<ReturnDto>();
        Teach.Equal(false, two?.AlreadyReturned, "Loan 2 is a different loan.");
        Teach.Equal(2, two?.ReturnedCount, "...and the second distinct id.");

        var repeat = await client.PostAsync("/d22/returns/5", null);
        await Teach.Status(HttpStatusCode.OK, repeat,
            "Shelving a book that is already on the shelf is not a failure. A test suite that "
                + "retries, or a client that lost the first response, must not be punished for "
                + "asking twice - so this is 200, not 409.");

        var again = await repeat.Content.ReadFromJsonAsync<ReturnDto>();
        Teach.Equal(true, again?.AlreadyReturned, "...but the answer says plainly that it is a repeat.");
        Teach.Equal(2, again?.ReturnedCount,
            "...and the count does NOT move. Two calls with the same loan id are one return; a "
                + "3 here means the second call had an effect, which is what makes a retried "
                + "suite flaky.");

        var report = await client.GetFromJsonAsync<ReturnsDto>("/d22/returns");
        Teach.Equal("2,5", string.Join(",", report?.Returned ?? []),
            "Ascending. 5 was shelved first, so \"5,2\" means the handler served whatever order "
                + "the store happened to hand back - and the order a HashSet enumerates in is "
                + "not a contract you may lean on.");
        Teach.Equal(2, report?.Count, "...and two distinct loans have come back.");

        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsync("/d22/returns/99", null),
            "There is no loan 99 to shelve. That is a 404 - not an idempotent success, and not "
                + "a 500 from indexing into nothing.");

        using var fresh = new DojoWebFactory();
        using var freshClient = fresh.CreateClient();

        var empty = await freshClient.GetFromJsonAsync<ReturnsDto>("/d22/returns");
        Teach.Equal(0, empty?.Count,
            "A host that has shelved nothing reports nothing. Anything else means the log is "
                + "static and this gate's result depends on which gates ran first.");
    }

    [Fact]
    public async Task Ex7_ThreeSeamsOnOneEndpointAndAllThreeAreUsed()
    {
        using var root = new DojoWebFactory();
        var recorder = new RecordingNotifier();
        using var host = WithSeams(
            root, now: new DateTimeOffset(2026, 3, 4, 9, 30, 0, TimeSpan.Zero), notifier: recorder);
        using var client = host.CreateClient();

        var ok = await client.PostAsync("/d22/renewals/1", null);
        await Teach.Status(HttpStatusCode.OK, ok,
            "Loan 1 is not overdue at all, so it renews - reread README ex7.");

        var renewal = await ok.Content.ReadFromJsonAsync<RenewalDto>();
        Teach.Equal("m-014", renewal?.CardId, "Loan 1 belongs to m-014...");
        Teach.Equal("bk-101", renewal?.Code, "...and it is bk-101.");
        Teach.Equal("2026-03-04T09:30:00Z", renewal?.RenewedAt,
            "This host's clock is fixed at 2026-03-04T09:30:00Z, so that is when the renewal "
                + "happened.");
        Teach.Equal("2026-03-18T09:30:00Z", renewal?.DueAt,
            "...and LoanDays defaults to 14, which lands on 2026-03-18T09:30:00Z.");
        Teach.Equal(0, recorder.Count,
            "Nothing was refused, so nobody should have been notified. Sweeping the notifier "
                + "on every call makes the seam useless as evidence.");

        var grace = await client.PostAsync("/d22/renewals/5", null);
        await Teach.Status(HttpStatusCode.OK, grace,
            "Loan 5 is one day overdue and GraceDays defaults to 2. The rule is MORE than the "
                + "grace, not any overdue at all - reread the README before changing the "
                + "comparison.");
        Teach.Equal("2026-03-18T09:30:00Z", (await grace.Content.ReadFromJsonAsync<RenewalDto>())?.DueAt,
            "...and its new due date comes off the same clock.");
        Teach.Equal(0, recorder.Count, "...still nothing refused, still nothing notified.");

        var refused = await client.PostAsync("/d22/renewals/2", null);
        await Teach.Status(HttpStatusCode.Conflict, refused,
            "Loan 2 is three days overdue, which is more than the two-day grace. The loan "
                + "exists and the request is well formed - the desk simply refuses, and that "
                + "is 409, not 400 and not 404.");

        var refusal = await refused.Content.ReadFromJsonAsync<RefusedDto>();
        Teach.Equal(3, refusal?.DaysOverdue, "...and the body says how far past due it is...");
        Teach.Equal(2, refusal?.GraceDays, "...against the grace THIS host was configured with.");
        Teach.Equal("m-007|bk-102|3", recorder.Calls,
            "A refusal has to tell the notifier, through the injected IOverdueNotifier. An "
                + "empty string means either nothing was notified or the handler newed its own "
                + "notifier and this recorder never heard it.");

        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsync("/d22/renewals/99", null),
            "There is no loan 99, so there is nothing to renew or refuse: 404.");

        var other = new RecordingNotifier();
        using var lenient = WithSeams(
            root,
            now: new DateTimeOffset(2020, 1, 31, 23, 0, 0, TimeSpan.Zero),
            notifier: other,
            settings: new()
            {
                ["Dojo:D22:Loans:LoanDays"] = "7",
                ["Dojo:D22:Loans:GraceDays"] = "5",
            });
        using var lenientClient = lenient.CreateClient();

        var nowOk = await lenientClient.PostAsync("/d22/renewals/2", null);
        await Teach.Status(HttpStatusCode.OK, nowOk,
            "The SAME loan, on a host whose grace is five days. Three is not more than five, so "
                + "here it renews - a 409 means the grace is baked in rather than read from "
                + "options.");

        var moved = await nowOk.Content.ReadFromJsonAsync<RenewalDto>();
        Teach.Equal("2020-01-31T23:00:00Z", moved?.RenewedAt, "This host's clock says 31 January 2020.");
        Teach.Equal("2020-02-07T23:00:00Z", moved?.DueAt,
            "...and seven configured days on from 31 January is 7 February. A 14 February here "
                + "means LoanDays is still the default.");
        Teach.Equal(0, other.Count, "Nothing was refused on this host, so nothing was notified.");

        var stillRefused = await lenientClient.PostAsync("/d22/renewals/4", null);
        await Teach.Status(HttpStatusCode.Conflict, stillRefused,
            "Loan 4 is eleven days overdue, past even a five-day grace.");
        Teach.Equal("m-021|bk-101|11", other.Calls, "...and this host's recorder heard that one.");
        Teach.Equal(1, recorder.Count,
            "...while the first host's recorder still holds only its own single call. Two hosts, "
                + "two fakes, no crosstalk.");
    }

    [Fact]
    public async Task Ex8_TheWholeDeskWithEverySeamReplaced()
    {
        using var root = new DojoWebFactory();
        var recorder = new RecordingNotifier();
        using var host = WithSeams(
            root, now: new DateTimeOffset(2026, 5, 9, 14, 0, 0, TimeSpan.Zero), notifier: recorder);
        using var client = host.CreateClient();

        var blank = await client.PostAsJsonAsync("/d22/loans", new { cardId = "", code = "bk-101" });
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "An empty cardId is a malformed request, not a missing member - reread README ex8.");
        var problem = await blank.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(problem?.Errors is not null && problem.Errors.ContainsKey("cardId"),
            "...reported as a validation problem keyed \"cardId\", so the client is told which "
                + "field it got wrong.");

        var noCode = await client.PostAsJsonAsync("/d22/loans", new { cardId = "m-014", code = "   " });
        await Teach.Status(HttpStatusCode.BadRequest, noCode,
            "Three spaces is blank too - IsNullOrWhiteSpace, not IsNullOrEmpty.");
        Teach.True(
            (await noCode.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("code") == true,
            "...and this one is keyed \"code\".");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PostAsJsonAsync("/d22/loans", new { cardId = "m-999", code = "bk-101" }),
            "m-999 is a well-formed card id that no member holds. The request was fine; the "
                + "thing it named does not exist, so 404 rather than 400.");
        await Teach.Status(HttpStatusCode.NotFound,
            await client.PostAsJsonAsync("/d22/loans", new { cardId = "m-014", code = "bk-999" }),
            "...and bk-999 is no book either.");

        var issued = await client.PostAsJsonAsync("/d22/loans", new { cardId = "m-007", code = "bk-104" });
        await Teach.Status(HttpStatusCode.Created, issued,
            "m-007 holds two seeded loans and the default limit is three, so this one goes out: "
                + "201.");
        Teach.Equal("/d22/loans/1001", issued.Headers.Location?.ToString(),
            "...with a Location naming the loan that was just created.");

        var loan = await issued.Content.ReadFromJsonAsync<IssuedDto>();
        Teach.Equal(1001, loan?.Id, "LoanBook.NextId starts every host at 1001.");
        Teach.Equal("The Pragmatic Programmer", loan?.Title, "bk-104 is The Pragmatic Programmer.");
        Teach.Equal("2026-05-09T14:00:00Z", loan?.IssuedAt, "...issued at this host's fixed instant...");
        Teach.Equal("2026-05-23T14:00:00Z", loan?.DueAt, "...and due fourteen days later.");
        Teach.Equal(true, loan?.Warned,
            "m-007 already has an overdue loan, so the desk warns him as the new book goes out.");
        Teach.Equal("m-007|bk-102|3", recorder.Calls,
            "...and the warning names the MOST overdue loan - loan 2, bk-102, three days - not "
                + "the book being borrowed right now. An empty string means the notifier came "
                + "from a `new` instead of the container.");

        var read = await client.GetAsync("/d22/loans/1001");
        await Teach.Status(HttpStatusCode.OK, read,
            "The Location handed out above has to be fetchable, or 201 promised something the "
                + "server cannot deliver.");
        Teach.Equal("The Pragmatic Programmer", (await read.Content.ReadFromJsonAsync<IssuedDto>())?.Title,
            "...and it is the same loan.");
        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d22/loans/4242"),
            "This host never issued a loan 4242: 404.");

        var full = await client.PostAsJsonAsync("/d22/loans", new { cardId = "m-007", code = "bk-101" });
        await Teach.Status(HttpStatusCode.Conflict, full,
            "m-007 now holds three loans and three is the limit. Everything named in the "
                + "request exists and the shape is fine - the rule says no, which is 409.");

        var refusal = await full.Content.ReadFromJsonAsync<RefusalDto>();
        Teach.Equal(3, refusal?.Open,
            "Two seeded loans plus the one just issued. A 2 means the count ignored the loans "
                + "this endpoint itself created, so a member can borrow forever by retrying.");
        Teach.Equal(3, refusal?.MaxPerMember, "...against the limit this host was configured with.");
        Teach.Equal(1, recorder.Count,
            "A refusal is not a checkout, so nobody is warned. Notifying before the rule check "
                + "sends a slip for a loan that never happened.");

        var clean = await client.PostAsJsonAsync("/d22/loans", new { cardId = "m-014", code = "bk-109" });
        await Teach.Status(HttpStatusCode.Created, clean, "m-014 holds two and is still under the limit.");
        var second = await clean.Content.ReadFromJsonAsync<IssuedDto>();
        Teach.Equal(1002, second?.Id, "...and ids keep climbing on this host.");
        Teach.Equal(false, second?.Warned, "Neither of m-014's loans is overdue...");
        Teach.Equal(1, recorder.Count, "...so the notifier was not called a second time.");

        var other = new RecordingNotifier();
        using var relaxed = WithSeams(
            root,
            now: new DateTimeOffset(2030, 1, 1, 0, 0, 0, TimeSpan.Zero),
            notifier: other,
            settings: new()
            {
                ["Dojo:D22:Loans:MaxPerMember"] = "4",
                ["Dojo:D22:Loans:LoanDays"] = "21",
            });
        using var relaxedClient = relaxed.CreateClient();

        var elsewhere = await relaxedClient.PostAsJsonAsync(
            "/d22/loans", new { cardId = "m-014", code = "bk-107" });
        await Teach.Status(HttpStatusCode.Created, elsewhere,
            "A different host, a different policy, a different clock - and the same code.");

        var far = await elsewhere.Content.ReadFromJsonAsync<IssuedDto>();
        Teach.Equal(1001, far?.Id,
            "This host has issued nothing, so its first loan is 1001 again. A 1003 means the "
                + "LoanBook is shared with the host above.");
        Teach.Equal("2030-01-01T00:00:00Z", far?.IssuedAt, "Its clock says the first of January 2030...");
        Teach.Equal("2030-01-22T00:00:00Z", far?.DueAt,
            "...and its configured LoanDays of 21 puts the due date on the 22nd.");
        Teach.Equal(false, far?.Warned, "m-014 has nothing overdue.");
        Teach.Equal(0, other.Count, "...so this host's recorder heard nothing at all.");

        await Teach.Status(HttpStatusCode.NotFound, await relaxedClient.GetAsync("/d22/loans/1002"),
            "Loan 1002 exists on the other host and must be invisible here. If it is not, the "
                + "state is static and every one of these numbers is an accident of ordering.");
    }

    // ... private helpers and DTO records, listed below ...

    /// <summary>Boots src/Api with any of the three seams replaced: the clock, the notifier, the policy.</summary>
    private static WebApplicationFactory<Program> WithSeams(
        DojoWebFactory root,
        DateTimeOffset? now = null,
        IOverdueNotifier? notifier = null,
        Dictionary<string, string?>? settings = null) =>
        root.WithWebHostBuilder(builder =>
        {
            if (settings is not null)
            {
                builder.ConfigureAppConfiguration(config => config.AddInMemoryCollection(settings));
            }

            builder.ConfigureServices(services =>
            {
                if (now is not null)
                {
                    services.RemoveAll<TimeProvider>();
                    services.AddSingleton<TimeProvider>(new FixedClock(now.Value));
                }

                if (notifier is not null)
                {
                    services.RemoveAll<IOverdueNotifier>();
                    services.AddSingleton(notifier);
                }
            });
        });

    /// <summary>A clock that never moves. No NuGet package needed - TimeProvider is abstract on purpose.</summary>
    private sealed class FixedClock(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;

        public override TimeZoneInfo LocalTimeZone => TimeZoneInfo.Utc;
    }

    /// <summary>An IOverdueNotifier that remembers what it was asked to do.</summary>
    private sealed class RecordingNotifier : IOverdueNotifier
    {
        private readonly List<string> _calls = [];

        public string Calls
        {
            get
            {
                lock (_calls)
                {
                    return string.Join(", ", _calls);
                }
            }
        }

        public int Count
        {
            get
            {
                lock (_calls)
                {
                    return _calls.Count;
                }
            }
        }

        public void Notify(string cardId, string code, int daysOverdue)
        {
            lock (_calls)
            {
                _calls.Add($"{cardId}|{code}|{daysOverdue}");
            }
        }
    }

    private sealed record HoldDto(int Id, string? Code, string? CardId);

    private sealed record DueDto(string? IssuedAt, string? DueAt, int LoanDays);

    private sealed record ReceiptDto(string? Reference, int Sequence);

    private sealed record SweepDto(int Notified);

    private sealed record AllowanceDto(
        string? CardId, string? Name, int OnLoan, int MaxLoans, bool CanBorrow);

    private sealed record ReturnDto(int LoanId, bool AlreadyReturned, int ReturnedCount);

    private sealed record ReturnsDto(List<int>? Returned, int Count);

    private sealed record RenewalDto(
        int LoanId, string? CardId, string? Code, string? RenewedAt, string? DueAt);

    private sealed record RefusedDto(int LoanId, int DaysOverdue, int GraceDays);

    private sealed record IssuedDto(
        int Id, string? CardId, string? Code, string? Title,
        string? IssuedAt, string? DueAt, bool Warned);

    private sealed record RefusalDto(string? CardId, int Open, int MaxPerMember);

    private sealed record ValidationDto(Dictionary<string, string[]>? Errors);
}
