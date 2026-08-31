using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.D23_PaginationFiltering;

namespace DotnetDojo.Gates;

public class D23_PaginationFilteringTests
{
    [Fact]
    public async Task Ex1_OffsetPagingHasDefaultsAndBounds()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d23/postings");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d23/postings with no query string must answer 200 with the first page - "
                + "reread README ex1.");
        Teach.Equal("1,2,3,4,5,6,7,8,9,10", Ids(await first.Content.ReadFromJsonAsync<List<CardDto>>()),
            "No page and no size means page 1 of size 10, id ascending. Getting 11..20 "
                + "means the skip is page*size instead of (page-1)*size - page 1 skips "
                + "nothing.");

        var last = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings?page=3");
        Teach.Equal("21,22,23,24,25", Ids(last),
            "25 postings, size 10, so page 3 is the short last page: ids 21..25.");

        var small = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings?page=2&size=4");
        Teach.Equal("5,6,7,8", Ids(small),
            "size=4 makes page 2 the fifth through eighth rows. Skip is (page-1)*size = 4, "
                + "take is 4.");
        Teach.Equal("Systems Engineer", small?[0].Title,
            "...and posting 5 is the Systems Engineer, so the order really is by id.");

        var zero = await client.GetAsync("/d23/postings?page=0");
        await Teach.Status(HttpStatusCode.BadRequest, zero,
            "page=0 is not a page. Clamping it to 1 silently answers a question nobody "
                + "asked; skipping -10 rows is worse. Reject it.");
        var pageProblem = await zero.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(pageProblem?.Errors is not null && pageProblem.Errors.ContainsKey("page"),
            "...as a validation problem whose errors dictionary is keyed \"page\", so the "
                + "client is told which parameter it got wrong.");

        var huge = await client.GetAsync("/d23/postings?size=200");
        await Teach.Status(HttpStatusCode.BadRequest, huge,
            "size=200 is above the 50 row ceiling. An unbounded size is how one client "
                + "turns a paged endpoint back into a full table scan.");
        var sizeProblem = await huge.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(sizeProblem?.Errors is not null && sizeProblem.Errors.ContainsKey("size"),
            "...and that one is keyed \"size\", not \"page\".");
    }

    [Fact]
    public async Task Ex2_TheEnvelopeCountsInTheDatabase()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d23/postings/page");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d23/postings/page must answer 200 with the envelope - reread README ex2.");

        var page = await response.Content.ReadFromJsonAsync<PageDto>();
        Teach.Equal("1,2,3,4,5,6,7,8,9,10", Ids(page?.Items),
            "items holds the page itself: page 1, size 10, id ascending. A null here means "
                + "the JSON field is not called \"items\".");
        Teach.Equal(1, page?.Page, "page echoes the page that was served, defaulting to 1.");
        Teach.Equal(10, page?.Size, "size echoes the page size, defaulting to 10.");
        Teach.Equal(25, page?.Total,
            "total is every row that matches, not the ten on this page. 10 means you "
                + "counted the list you already had.");
        Teach.Equal(3, page?.TotalPages,
            "25 rows in pages of 10 is 3 pages, not 2. Integer division truncates - round "
                + "up.");

        Teach.True(host.Commands.Count <= 2,
            $"That envelope took {host.Commands.Count} queries; two is the budget - one "
                + "COUNT and one page. Loading every row to count it in memory is exactly "
                + "the cost paging exists to avoid.");

        host.Commands.Reset();
        var third = await client.GetFromJsonAsync<PageDto>("/d23/postings/page?page=3&size=4");
        Teach.Equal("9,10,11,12", Ids(third?.Items), "size=4, page 3: skip 8, take 4.");
        Teach.Equal(3, third?.Page, "...and page reports 3.");
        Teach.Equal(4, third?.Size, "...and size reports 4.");
        Teach.Equal(25, third?.Total, "total does not shrink when the page does.");
        Teach.Equal(7, third?.TotalPages,
            "25 rows in pages of 4 is 7 pages: six full ones and a last page holding one "
                + "row.");
        Teach.True(host.Commands.Count <= 2, "...still within the two query budget.");
    }

    [Fact]
    public async Task Ex3_SortIsAWhitelistWithAStableTiebreak()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var oldest = await client.GetAsync("/d23/postings/sorted?sort=postedDay");
        await Teach.Status(HttpStatusCode.OK, oldest,
            "GET /d23/postings/sorted?sort=postedDay must answer 200 - reread README ex3.");
        Teach.Equal("9,18,2,6,13,25,1,4,15,24",
            Ids(await oldest.Content.ReadFromJsonAsync<List<CardDto>>()),
            "postedDay ascending: days 2,3,5,7,9,11,12,12,14,15. Postings 1 and 4 both sit "
                + "on day 12, and 1 comes first because the tiebreak is id ascending. Ids "
                + "1..10 means the sort parameter was ignored.");

        var newest = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings/sorted?sort=-postedDay");
        Teach.Equal("23,10,14,21,5,17,12,19,3,16", Ids(newest),
            "The leading minus reverses the column: days 60,55,50,47,44,41,37,33,31,28. "
                + "The tiebreak stays id ASCENDING even here, which is what the README "
                + "says and what the gate compares.");

        var cheap = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings/sorted?sort=salaryMax");
        Teach.Equal("10,23,25,4,15,17,7,12,2,21", Ids(cheap),
            "salaryMax ascending: 65000, 75000, 80000, 85000, 90000, 95000, 100000, "
                + "105000, 110000, 115000.");

        var page2 = await client.GetFromJsonAsync<List<CardDto>>(
            "/d23/postings/sorted?sort=salaryMax&page=2");
        Teach.Equal("9,1,14,5,24,8,20,6,16,13", Ids(page2),
            "Page 2 of the same sort. Postings 1 and 14 both top out at 120000, and 1 wins "
                + "the tie - a sort with no tiebreak can put either one on either page, so "
                + "a row is silently skipped or shown twice.");

        var byTitle = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings/sorted?sort=title");
        Teach.Equal("11,4,8,2,17,14,6,22,13,19", Ids(byTitle),
            "title A-Z: API Engineer, Backend Developer, Cloud Architect, Data Analyst, "
                + "Database Engineer, DevOps Engineer, Frontend Developer, Full Stack "
                + "Engineer, Integration Engineer, Machine Learning Engineer.");

        var byDefault = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings/sorted");
        Teach.Equal("9,18,2,6,13,25,1,4,15,24", Ids(byDefault),
            "No sort at all means postedDay ascending - the same answer as ?sort=postedDay.");

        var bad = await client.GetAsync("/d23/postings/sorted?sort=salary");
        await Teach.Status(HttpStatusCode.BadRequest, bad,
            "\"salary\" is not in D23Board.Sorts. Ignoring an unknown sort and serving the "
                + "default order is how a client ships a typo to production and never "
                + "notices its report is in the wrong order.");
        var problem = await bad.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(problem?.Errors is not null && problem.Errors.ContainsKey("sort"),
            "...as a validation problem keyed \"sort\". Feeding the raw value into a "
                + "string switch that falls through to a default is the same bug wearing a "
                + "hat.");
    }

    [Fact]
    public async Task Ex4_EveryFilterIsAndedInOneQuery()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var all = await client.GetAsync("/d23/postings/filter");
        await Teach.Status(HttpStatusCode.OK, all,
            "GET /d23/postings/filter with no filters must answer 200 with everything - "
                + "reread README ex4.");
        Teach.Equal(25, (await all.Content.ReadFromJsonAsync<List<CardDto>>())?.Count,
            "No filter was asked for, so nothing is filtered out.");
        Teach.Equal(1, host.Commands.Count,
            "One query. Optional filters compose onto the SAME IQueryable; running "
                + "ToList first and filtering the list afterwards costs a full table read "
                + "every time.");

        var remote = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings/filter?remote=true");
        Teach.Equal("1,3,5,7,9,11,13,15,17,19,21,23,25", Ids(remote),
            "Thirteen postings are remote, id ascending.");

        var both = await client.GetFromJsonAsync<List<CardDto>>(
            "/d23/postings/filter?location=Berlin&remote=false");
        Teach.Equal("2,12,22", Ids(both),
            "Two filters are ANDed, never ORed: five postings are in Berlin, three of "
                + "those are not remote. Five results means the conditions were combined "
                + "with ||.");

        host.Commands.Reset();
        var narrow = await client.GetFromJsonAsync<List<CardDto>>(
            "/d23/postings/filter?remote=true&minSalary=120000&tag=azure");
        Teach.Equal("3,13,19", Ids(narrow),
            "Remote AND salaryMax at least 120000 AND tagged azure. Six remote postings "
                + "clear 120000 (1,3,5,11,13,19) and three of them carry the azure tag.");
        Teach.Equal(1, host.Commands.Count, "...three filters, still one query.");

        var sql = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings/filter?tag=sql");
        Teach.Equal("1,4,5,9,17,22,23", Ids(sql),
            "Seven postings are tagged sql. Nine means 12 and 16 came along: they are "
                + "tagged \"nosql\", and \"nosql\" CONTAINS the three letters s-q-l. A tag "
                + "is a whole list element, so match on the delimiters around it.");

        var nosql = await client.GetFromJsonAsync<List<CardDto>>("/d23/postings/filter?tag=nosql");
        Teach.Equal("12,16", Ids(nosql), "...and nosql is its own tag, on exactly two postings.");

        var nothing = await client.GetAsync("/d23/postings/filter?location=Austin&tag=react");
        await Teach.Status(HttpStatusCode.OK, nothing,
            "Nobody in Austin is hiring for react. That is a legal question with no "
                + "answers: 200 and an empty array, not 404.");
        Teach.Equal(0, (await nothing.Content.ReadFromJsonAsync<List<CardDto>>())?.Count,
            "...and the array is empty.");
    }

    [Fact]
    public async Task Ex5_TheEnvelopeCarriesItsOwnNavigation()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d23/postings/linked");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d23/postings/linked must answer 200 with the linked envelope - reread "
                + "README ex5.");

        var page1 = await first.Content.ReadFromJsonAsync<LinkedDto>();
        Teach.Equal("1,2,3,4,5,6,7,8,9,10", Ids(page1?.Items), "Page 1 of 3, id ascending.");
        Teach.Equal(3, page1?.TotalPages, "25 rows in tens is three pages.");
        Teach.Equal("/d23/postings/linked?page=2&size=10", page1?.Next,
            "next points at page 2 and spells out BOTH parameters, in the order page then "
                + "size, so a client can follow it without reconstructing anything.");
        Teach.Equal((string?)null, page1?.Prev,
            "There is nothing before page 1, so prev is null - not an empty string and not "
                + "a link back to page 0.");

        var page3 = await client.GetFromJsonAsync<LinkedDto>("/d23/postings/linked?page=3");
        Teach.Equal("21,22,23,24,25", Ids(page3?.Items), "The last page holds five rows.");
        Teach.Equal((string?)null, page3?.Next,
            "Page 3 is the last page, so next is null. A next link that always exists "
                + "walks a client off the end of the result set forever.");
        Teach.Equal("/d23/postings/linked?page=2&size=10", page3?.Prev, "...and prev goes back to 2.");

        var middle = await client.GetFromJsonAsync<LinkedDto>("/d23/postings/linked?page=2&size=4");
        Teach.Equal("5,6,7,8", Ids(middle?.Items), "size=4, page 2.");
        Teach.Equal(7, middle?.TotalPages, "25 rows in fours is seven pages.");
        Teach.Equal("/d23/postings/linked?page=1&size=4", middle?.Prev,
            "The links carry the size the CLIENT chose. Hard coding size=10 into them "
                + "resets the page size on the first click.");
        Teach.Equal("/d23/postings/linked?page=3&size=4", middle?.Next, "...and so does next.");

        var past = await client.GetAsync("/d23/postings/linked?page=4");
        await Teach.Status(HttpStatusCode.OK, past,
            "Page 4 of a three page result is empty, not missing. The collection exists; "
                + "this window of it happens to contain nothing. 404 makes a client that "
                + "over-scrolled look like a client that asked for a deleted resource.");
        var beyond = await past.Content.ReadFromJsonAsync<LinkedDto>();
        Teach.Equal("", Ids(beyond?.Items), "...so items is empty.");
        Teach.Equal(4, beyond?.Page, "...page still echoes what was asked for.");
        Teach.Equal(25, beyond?.Total, "...total still counts the whole result set.");
        Teach.Equal(3, beyond?.TotalPages, "...and totalPages is still 3.");
        Teach.Equal((string?)null, beyond?.Next, "There is no page 5, so next is null.");
        Teach.Equal("/d23/postings/linked?page=3&size=10", beyond?.Prev,
            "...but prev is page 3, so a client that over-scrolled can walk back.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.GetAsync("/d23/postings/linked?page=0"),
            "page=0 is still a 400 here - out of RANGE and out of BOUNDS are different "
                + "failures, and only one of them is the client's fault.");
    }

    [Fact]
    public async Task Ex6_AKeysetCursorSurvivesAnInsert()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var opening = await client.GetAsync("/d23/postings/keyset");
        await Teach.Status(HttpStatusCode.OK, opening,
            "GET /d23/postings/keyset with no cursor must answer 200 with the first page - "
                + "reread README ex6.");
        Teach.Equal("9,18,2,6,13,25,1,4,15,24",
            Ids((await opening.Content.ReadFromJsonAsync<CursorDto>())?.Items),
            "No cursor means start at the beginning: postedDay ascending, id ascending, "
                + "ten rows.");

        host.Commands.Reset();
        var response = await client.GetAsync("/d23/postings/keyset?size=5");
        var first = await response.Content.ReadFromJsonAsync<CursorDto>();
        Teach.Equal("9,18,2,6,13", Ids(first?.Items), "size=5 cuts the same order at five rows.");
        Teach.Equal(D23Cursor.Encode(9, 13), first?.NextCursor,
            "nextCursor is the key of the LAST row on this page - posting 13, day 9 - "
                + "encoded with D23Cursor.Encode. A row index or a page number here is not "
                + "a keyset cursor.");
        Teach.Equal(1, host.Commands.Count,
            $"That page took {host.Commands.Count} queries; one is the budget. Fetch "
                + "size+1 rows and let the extra row answer \"is there more\" - a separate "
                + "COUNT is a second round trip for a question you already have the data "
                + "for.");

        var second = await client.GetFromJsonAsync<CursorDto>(
            $"/d23/postings/keyset?size=5&after={first?.NextCursor}");
        Teach.Equal("25,1,4,15,24", Ids(second?.Items),
            "Following the cursor resumes immediately after posting 13 - no overlap and no "
                + "gap.");
        Teach.Equal(D23Cursor.Encode(15, 24), second?.NextCursor,
            "...and the next cursor is posting 24 on day 15.");

        var tie = await client.GetFromJsonAsync<CursorDto>(
            $"/d23/postings/keyset?size=3&after={D23Cursor.Encode(12, 1)}");
        Teach.Equal("4,15,24", Ids(tie?.Items),
            "Postings 1 and 4 SHARE day 12. Resuming after (12,1) must still return 4, so "
                + "the predicate is (PostedDay > d) OR (PostedDay = d AND Id > id). Getting "
                + "15,24,11 means the comparison was PostedDay > 12 alone, and posting 4 "
                + "was silently dropped from the feed forever.");

        var tail = await client.GetFromJsonAsync<CursorDto>(
            $"/d23/postings/keyset?size=10&after={D23Cursor.Encode(41, 17)}");
        Teach.Equal("5,21,14,10,23", Ids(tail?.Items), "Five rows remain after posting 17.");
        Teach.Equal((string?)null, tail?.NextCursor,
            "Nothing follows the last row, so nextCursor is null - that null is the only "
                + "stop signal a keyset client gets.");

        host.Query(db =>
        {
            db.Postings.Add(new Posting
            {
                Id = 26,
                Title = "Overnight Addition",
                Company = "Contoso",
                Location = "Oslo",
                Remote = true,
                SalaryMin = 50000,
                SalaryMax = 70000,
                PostedDay = 1,
                Tags = "dotnet",
            });
            return db.SaveChanges();
        });

        var again = await client.GetFromJsonAsync<CursorDto>(
            $"/d23/postings/keyset?size=5&after={first?.NextCursor}");
        Teach.Equal("25,1,4,15,24", Ids(again?.Items),
            "A posting on day 1 was inserted BEFORE everything the client has already "
                + "seen. Offset paging would now shift every later row down one and repeat "
                + "posting 13; a cursor names a place in the order, not a count of rows "
                + "skipped, so the answer does not move.");

        var huge = await client.GetAsync("/d23/postings/keyset?size=99");
        await Teach.Status(HttpStatusCode.BadRequest, huge,
            "A cursor does not exempt you from bounding the page: size=99 is above the 50 "
                + "row ceiling.");
        var problem = await huge.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(problem?.Errors is not null && problem.Errors.ContainsKey("size"),
            "...keyed \"size\".");
    }

    [Fact]
    public async Task Ex7_FilterSortAndCursorOnOneQuery()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d23/postings/feed?remote=true&size=4");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d23/postings/feed?remote=true&size=4 must answer 200 - reread README "
                + "ex7.");
        var page1 = await response.Content.ReadFromJsonAsync<CursorDto>();
        Teach.Equal("9,13,25,1", Ids(page1?.Items),
            "Remote postings only, postedDay ascending: days 2, 9, 11, 12.");
        Teach.Equal(D23Cursor.Encode(12, 1), page1?.NextCursor,
            "...and the cursor is the last row of the FILTERED page, posting 1 on day 12.");
        Teach.Equal(1, host.Commands.Count,
            $"Filter plus sort plus cursor took {host.Commands.Count} queries; one is the "
                + "budget. All three are Where/OrderBy/Take on the same IQueryable, so "
                + "they collapse into a single SELECT.");

        var page2 = await client.GetFromJsonAsync<CursorDto>(
            $"/d23/postings/feed?remote=true&size=4&after={page1?.NextCursor}");
        Teach.Equal("15,11,7,3", Ids(page2?.Items),
            "The filter has to be reapplied on the next call - the cursor carries a "
                + "position, not a result set. Ids 2,4,6,... appearing here means remote "
                + "was only honoured on the first page.");

        var rich = await client.GetFromJsonAsync<CursorDto>(
            "/d23/postings/feed?remote=true&minSalary=100000&size=3");
        Teach.Equal("9,13,1", Ids(rich?.Items),
            "Remote AND salaryMax at least 100000, oldest first: postings 9 (day 2), 13 "
                + "(day 9) and 1 (day 12). Posting 25 sits between them on day 11 and tops "
                + "out at 80000, so minSalary drops it.");

        var desc = await client.GetFromJsonAsync<CursorDto>(
            "/d23/postings/feed?tag=azure&sort=-postedDay&size=3");
        Teach.Equal("21,19,3", Ids(desc?.Items),
            "Eight postings carry the azure tag; newest first that is days 47, 33, 31.");
        Teach.Equal(D23Cursor.Encode(31, 3), desc?.NextCursor, "...cursor at posting 3, day 31.");

        var desc2 = await client.GetFromJsonAsync<CursorDto>(
            $"/d23/postings/feed?tag=azure&sort=-postedDay&size=3&after={desc?.NextCursor}");
        Teach.Equal("16,13,6", Ids(desc2?.Items),
            "Descending, the cursor comparison flips too: (PostedDay < d) OR (PostedDay = "
                + "d AND Id < id). Keeping > here returns the rows the client has already "
                + "seen, which loops forever.");

        var desc3 = await client.GetFromJsonAsync<CursorDto>(
            $"/d23/postings/feed?tag=azure&sort=-postedDay&size=3&after={desc2?.NextCursor}");
        Teach.Equal("2,18", Ids(desc3?.Items), "Two azure postings are left: days 5 and 3.");
        Teach.Equal((string?)null, desc3?.NextCursor,
            "...and a short page with nothing behind it ends the feed with a null cursor.");

        var junk = await client.GetAsync("/d23/postings/feed?after=not-a-cursor");
        await Teach.Status(HttpStatusCode.BadRequest, junk,
            "\"not-a-cursor\" is not something D23Cursor.TryDecode can read. Treating a "
                + "cursor it cannot parse as \"no cursor\" restarts the feed from the top "
                + "and the client loops over page 1 forever.");
        var problem = await junk.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(problem?.Errors is not null && problem.Errors.ContainsKey("after"),
            "...as a validation problem keyed \"after\".");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.GetAsync("/d23/postings/feed?after=zzzz"),
            "\"zzzz\" is legal base64 that decodes to no cursor at all. TryDecode returning "
                + "false is the whole test - do not assume that anything decodable is a key.");

        var badSort = await client.GetAsync("/d23/postings/feed?sort=title");
        await Teach.Status(HttpStatusCode.BadRequest, badSort,
            "title is in D23Board.Sorts but NOT in D23Board.FeedSorts: a cursor cut over "
                + "(PostedDay, Id) cannot resume a title ordering, so the feed refuses it.");
        var sortProblem = await badSort.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(sortProblem?.Errors is not null && sortProblem.Errors.ContainsKey("sort"),
            "...keyed \"sort\".");
    }

    [Fact]
    public async Task Ex8_TheSearchEndpointReportsEveryBadParameterAtOnce()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var bad = await client.GetAsync(
            "/d23/postings/search?page=0&size=99&sort=random&location=Mars&minSalary=-5");
        await Teach.Status(HttpStatusCode.BadRequest, bad,
            "Five parameters are wrong at once, so the answer is 400 - reread README ex8.");
        var problem = await bad.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(problem?.Errors is not null, "...as a validation problem with an errors dictionary.");
        Teach.Equal("location,minSalary,page,size,sort",
            string.Join(",", (problem?.Errors ?? []).Keys.OrderBy(k => k, StringComparer.Ordinal)),
            "All five keys, in one response. Returning on the first bad parameter makes the "
                + "client fix one thing, resubmit, and fail again - five round trips to "
                + "learn what one response could have said.");

        host.Commands.Reset();
        var response = await client.GetAsync(
            "/d23/postings/search?remote=true&tag=dotnet&sort=-salaryMax&size=4&page=1");
        await Teach.Status(HttpStatusCode.OK, response, "A well formed search answers 200.");
        var page1 = await response.Content.ReadFromJsonAsync<LinkedDto>();
        Teach.Equal("3,13,5,1", Ids(page1?.Items),
            "Remote AND tagged dotnet is seven postings (1,3,5,9,13,21,25); by salaryMax "
                + "descending that starts 170000, 150000, 125000, 120000.");
        Teach.Equal(7, page1?.Total, "total counts the FILTERED rows, not all 25.");
        Teach.Equal(2, page1?.TotalPages, "Seven rows in fours is two pages.");
        Teach.Equal((string?)null, page1?.Prev, "Nothing precedes page 1.");
        Teach.Equal("/d23/postings/search?page=2&size=4&sort=-salaryMax&remote=true&tag=dotnet",
            page1?.Next,
            "The next link has to carry the filters forward, in the README's order: page, "
                + "size, sort, remote, location, minSalary, tag. Dropping them sends the "
                + "client to page 2 of a completely different result set. \"remote=True\" "
                + "with a capital T is bool.ToString() - the wire wants lowercase.");
        Teach.True(host.Commands.Count <= 2,
            $"The search took {host.Commands.Count} queries; two is the budget - one COUNT "
                + "and one page, over the same filtered IQueryable.");

        var page2 = await client.GetFromJsonAsync<LinkedDto>(
            "/d23/postings/search?remote=true&tag=dotnet&sort=-salaryMax&size=4&page=2");
        Teach.Equal("9,21,25", Ids(page2?.Items), "The last three: 118000, 115000, 80000.");
        Teach.Equal((string?)null, page2?.Next, "Page 2 of 2 has nothing after it.");
        Teach.Equal("/d23/postings/search?page=1&size=4&sort=-salaryMax&remote=true&tag=dotnet",
            page2?.Prev, "...and prev carries the same filters back.");

        var plain = await client.GetFromJsonAsync<LinkedDto>("/d23/postings/search");
        Teach.Equal("9,18,2,6,13,25,1,4,15,24", Ids(plain?.Items),
            "No parameters at all: page 1, size 10, sort postedDay ascending, no filters.");
        Teach.Equal(25, plain?.Total, "...over all 25 postings.");
        Teach.Equal("/d23/postings/search?page=2&size=10", plain?.Next,
            "Nothing optional was supplied, so nothing optional appears in the link - page "
                + "and size only.");

        var empty = await client.GetAsync("/d23/postings/search?location=Austin&tag=react");
        await Teach.Status(HttpStatusCode.OK, empty,
            "A legal search that matches nothing is 200, the same as in ex4.");
        var none = await empty.Content.ReadFromJsonAsync<LinkedDto>();
        Teach.Equal("", Ids(none?.Items), "...with an empty items array.");
        Teach.Equal(0, none?.Total, "...a total of 0.");
        Teach.Equal(0, none?.TotalPages,
            "...and 0 pages, not 1. Rounding 0/10 up is still 0, and a client that trusts "
                + "totalPages should be told there is nothing to walk.");
        Teach.Equal((string?)null, none?.Next, "There is no page 2 of nothing.");
        Teach.Equal((string?)null, none?.Prev, "...and nothing before page 1 either.");
    }

    // ... private helpers and DTO records, listed below ...

    private static SqliteHost<D23Db> NewHost() =>
        new SqliteHost<D23Db>().Seed(db => db.Postings.AddRange(
            Row(1, "Platform Engineer", "Northwind", "Austin", true, 90000, 120000, 12, "dotnet,sql"),
            Row(2, "Data Analyst", "Contoso", "Berlin", false, 80000, 110000, 5, "dotnet,azure"),
            Row(3, "Site Reliability Engineer", "Fabrikam", "Denver", true, 130000, 170000, 31, "azure,dotnet"),
            Row(4, "Backend Developer", "Litware", "Lisbon", false, 60000, 85000, 12, "sql,python"),
            Row(5, "Systems Engineer", "Northwind", "Oslo", true, 95000, 125000, 44, "sql,dotnet"),
            Row(6, "Frontend Developer", "Proseware", "Austin", false, 100000, 140000, 7, "azure,python"),
            Row(7, "Technical Writer", "Contoso", "Berlin", true, 70000, 100000, 23, "react"),
            Row(8, "Cloud Architect", "Fabrikam", "Denver", false, 85000, 130000, 23, "react,dotnet"),
            Row(9, "QA Engineer", "Litware", "Lisbon", true, 88000, 118000, 2, "dotnet,sql"),
            Row(10, "Mobile Developer", "Northwind", "Oslo", false, 45000, 65000, 55, "dotnet"),
            Row(11, "API Engineer", "Proseware", "Austin", true, 120000, 165000, 18, "python"),
            Row(12, "Staff Engineer", "Contoso", "Berlin", false, 75000, 105000, 37, "react,nosql"),
            Row(13, "Integration Engineer", "Fabrikam", "Denver", true, 110000, 150000, 9, "azure,dotnet"),
            Row(14, "DevOps Engineer", "Litware", "Lisbon", false, 90000, 120000, 50, "react,python"),
            Row(15, "Solutions Engineer", "Northwind", "Oslo", true, 65000, 90000, 14, "python"),
            Row(16, "Observability Engineer", "Proseware", "Austin", false, 105000, 145000, 28, "azure,nosql"),
            Row(17, "Database Engineer", "Contoso", "Berlin", true, 70000, 95000, 41, "sql"),
            Row(18, "Product Engineer", "Fabrikam", "Denver", false, 115000, 155000, 3, "azure,dotnet"),
            Row(19, "Machine Learning Engineer", "Litware", "Lisbon", true, 125000, 160000, 33, "azure,python"),
            Row(20, "Report Developer", "Northwind", "Oslo", false, 95000, 135000, 20, "dotnet,react"),
            Row(21, "Security Engineer", "Proseware", "Austin", true, 85000, 115000, 47, "dotnet,azure"),
            Row(22, "Full Stack Engineer", "Contoso", "Berlin", false, 140000, 180000, 26, "dotnet,sql"),
            Row(23, "Support Engineer", "Fabrikam", "Denver", true, 55000, 75000, 60, "sql"),
            Row(24, "Software Engineer", "Litware", "Lisbon", false, 98000, 128000, 15, "python,dotnet"),
            Row(25, "Reliability Engineer", "Northwind", "Oslo", true, 60000, 80000, 11, "dotnet")));

    private static Posting Row(
        int id, string title, string company, string location, bool remote,
        int salaryMin, int salaryMax, int postedDay, string tags) =>
        new()
        {
            Id = id,
            Title = title,
            Company = company,
            Location = location,
            Remote = remote,
            SalaryMin = salaryMin,
            SalaryMax = salaryMax,
            PostedDay = postedDay,
            Tags = tags,
        };

    private static string Ids(List<CardDto>? cards) =>
        string.Join(",", (cards ?? []).Select(c => c.Id));

    private sealed record CardDto(
        int Id,
        string? Title,
        string? Company,
        string? Location,
        bool Remote,
        int SalaryMin,
        int SalaryMax,
        int PostedDay);

    private sealed record PageDto(List<CardDto>? Items, int Page, int Size, int Total, int TotalPages);

    private sealed record LinkedDto(
        List<CardDto>? Items,
        int Page,
        int Size,
        int Total,
        int TotalPages,
        string? Next,
        string? Prev);

    private sealed record CursorDto(List<CardDto>? Items, int Size, string? NextCursor);

    private sealed record ValidationDto(Dictionary<string, string[]>? Errors);
}
