using CSharpDojo.D05_ClassesConstruction;

namespace CSharpDojo.Gates;

public class D05_ClassesConstructionTests
{
    [Fact]
    public void Ex1_AConstructorThatRefusesBadState()
    {
        Ticket ticket = new Ticket(" abc-1 ", 2);

        Teach.Equal("ABC-1", ticket.Code,
            "The constructor NORMALISES as well as validates: trimmed and upper-cased, once, "
                + "so nothing downstream has to do it again - reread README ex1.");
        Teach.Equal(2, ticket.Seats, "The seat count is stored as given.");
        Teach.Equal("ABC-1 x2", ticket.Describe(), "Describe reads the stored, normalised code.");

        Teach.Throws<ArgumentException>(() => new Ticket("", 1),
            "An empty code is structurally wrong, which is what ArgumentException means "
                + "- reread README ex1.");
        Teach.Throws<ArgumentException>(() => new Ticket("   ", 1),
            "...and whitespace is not content.");
        Teach.Throws<ArgumentOutOfRangeException>(() => new Ticket("A", 0),
            "Zero seats is a VALUE out of its range, which is a more precise exception than "
                + "ArgumentException - and ArgumentOutOfRangeException derives from it, so "
                + "picking the precise one costs nothing - reread README ex1.");
        Teach.Throws<ArgumentOutOfRangeException>(() => new Ticket("A", -3), "Negative likewise.");
    }

    [Fact]
    public void Ex2_OneConstructorCallingAnother()
    {
        Box box = new Box(2, 3, 4);
        Teach.Equal(24, box.Volume, "2 x 3 x 4 - reread README ex2.");
        Teach.True(!box.IsCube, "Three different dimensions is not a cube.");

        Box cube = new Box(3);
        Teach.Equal(3, cube.Width, "The one-argument constructor sets all three dimensions...");
        Teach.Equal(3, cube.Height, "...to the same value...");
        Teach.Equal(3, cube.Depth, "...by delegating with `: this(side, side, side)`.");
        Teach.Equal(27, cube.Volume, "3 cubed.");
        Teach.True(cube.IsCube, "And it knows it is one.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new Box(0),
            "The cube constructor inherits the validation because it DELEGATES. If this does "
                + "not throw, you copied the assignments instead of chaining - reread README ex2.");
        Teach.Throws<ArgumentOutOfRangeException>(() => new Box(1, 2, 0),
            "Every dimension is checked, not just the first.");
    }

    [Fact]
    public void Ex3_StaticFactoriesAndAPrivateConstructor()
    {
        Teach.Equal(212.0, Temperature.FromCelsius(100).Fahrenheit,
            "Boiling water - reread README ex3.");
        Teach.Equal(32.0, Temperature.FromCelsius(0).Fahrenheit, "Freezing water.");
        Teach.Equal(-40.0, Temperature.FromCelsius(-40).Fahrenheit,
            "The one temperature where the two scales agree - a good self-check.");

        Teach.Equal(100.0, Temperature.FromFahrenheit(212).Celsius, "...and back the other way.");
        Teach.Equal(0.0, Temperature.FromFahrenheit(32).Celsius, "Freezing again.");

        Teach.Equal(-273.15, Temperature.FromCelsius(-273.15).Celsius,
            "Absolute zero itself is allowed - the boundary is inclusive - reread README ex3.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Temperature.FromCelsius(-274),
            "Below absolute zero there is no such temperature.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Temperature.FromFahrenheit(-500),
            "And the Fahrenheit factory must apply the SAME rule - which it gets for free if "
                + "it converts and then calls the other factory - reread README ex3.");
    }

    [Fact]
    public void Ex4_AClassThatOwnsACollection()
    {
        List<string> source = new List<string> { "a", "b" };
        Playlist playlist = new Playlist(source);
        source.Add("c");

        Teach.Equal(2, playlist.Tracks.Count,
            "The constructor COPIED the tracks, so the caller adding to its own list afterwards "
                + "does not reach inside the playlist - reread README ex4.");

        playlist.Add("c");
        Teach.Equal("a, b, c", string.Join(", ", playlist.Tracks), "Add appends at the end.");

        Teach.True(playlist.Remove("b"), "Removing a track that is there reports true.");
        Teach.Equal("a, c", string.Join(", ", playlist.Tracks), "...and it is gone.");
        Teach.True(!playlist.Remove("zzz"), "Removing one that is not there reports false.");
        Teach.Equal("a, c", string.Join(", ", playlist.Tracks), "...and changes nothing.");

        Teach.True(playlist.MoveUp("c"), "c was second, so it can move up.");
        Teach.Equal("c, a", string.Join(", ", playlist.Tracks),
            "MoveUp SWAPS with the neighbour rather than removing and re-inserting "
                + "- reread README ex4.");
        Teach.True(!playlist.MoveUp("c"),
            "Now it is first, so there is nowhere to go - and index 0 must be rejected the "
                + "same way as a missing track - reread README ex4.");
        Teach.True(!playlist.MoveUp("nope"), "A track that is not there cannot move.");
    }

    [Fact]
    public void Ex5_ReadonlyDoesNotMeanImmutable()
    {
        string[] options = { "yes", "no" };
        Poll poll = new Poll(" Coffee? ", options);

        Teach.Equal("Coffee?", poll.Question, "The question is trimmed on the way in.");
        Teach.Equal(2, poll.Count, "Two options.");

        options[0] = "HACKED";
        Teach.Equal("yes", poll.Options()[0],
            "`readonly` stops the FIELD being reassigned; it does nothing about the array the "
                + "field points at. The constructor has to copy - reread README ex5.");

        string[] handedOut = poll.Options();
        handedOut[1] = "HACKED";
        Teach.Equal("no", poll.Options()[1],
            "...and the same applies on the way out: returning the field itself lets any caller "
                + "rewrite the poll - reread README ex5.");

        Teach.Throws<ArgumentException>(() => new Poll("  ", options), "A blank question is no question.");
        Teach.Throws<ArgumentException>(() => new Poll("Tea?", new[] { "only" }),
            "One option is not a choice.");
    }

    [Fact]
    public void Ex6_TakingAnObjectApart()
    {
        Coordinate london = new Coordinate(51.5, -0.12);

        (double latitude, double longitude) = london;
        Teach.Equal(51.5, latitude, "Deconstruct feeds the tuple assignment - reread README ex6.");
        Teach.Equal(-0.12, longitude, "...in declaration order.");

        (double lat, double lon, string hemisphere) = london;
        Teach.Equal(51.5, lat, "The three-part overload starts the same way...");
        Teach.Equal(-0.12, lon, "...for the first two components...");
        Teach.Equal("N", hemisphere,
            "...and adds a computed one. Overloads of Deconstruct are picked by the NUMBER of "
                + "variables on the left - reread README ex6.");

        Coordinate sydney = new Coordinate(-33.9, 151.2);
        (_, _, string southern) = sydney;
        Teach.Equal("S", southern, "A negative latitude is the southern hemisphere.");

        Coordinate corner = new Coordinate(90, 180);
        Teach.Equal(90.0, corner.Latitude, "The bounds themselves are valid.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new Coordinate(91, 0),
            "Past 90 degrees there is no more north to go - reread README ex6.");
        Teach.Throws<ArgumentOutOfRangeException>(() => new Coordinate(0, 181), "Longitude too.");
    }

    [Fact]
    public void Ex7_AnInvariantEveryMethodHasToKeep()
    {
        SeatMap map = new SeatMap(2, 3);

        Teach.Equal(6, map.Capacity, "Two rows of three - reread README ex7.");
        Teach.Equal(6, map.AvailableCount, "A new map is entirely free.");

        Teach.True(map.Reserve(1, 1), "The first booking succeeds.");
        Teach.Equal(5, map.AvailableCount, "...and the count follows it.");
        Teach.True(map.IsReserved(1, 1), "...and the seat says so.");

        Teach.True(!map.Reserve(1, 1),
            "Booking a taken seat fails - reread README ex7.");
        Teach.Equal(5, map.AvailableCount,
            "...and a FAILED booking must not change the count. This is the invariant: the "
                + "counter moves only when the array does - reread README ex7.");

        Teach.True(map.Reserve(2, 3), "A different seat is a different seat.");
        Teach.True(!map.IsReserved(1, 3),
            "Row 2 seat 3 is not row 1 seat 3. If this says true, your row/seat to index "
                + "arithmetic is wrong - reread README ex7.");
        Teach.Equal(4, map.AvailableCount, "Two booked out of six.");

        Teach.True(map.Release(1, 1), "Releasing a taken seat works...");
        Teach.Equal(5, map.AvailableCount, "...and gives the count back.");
        Teach.True(!map.Release(1, 1), "Releasing it twice fails...");
        Teach.Equal(5, map.AvailableCount, "...and must not inflate the count past reality.");

        Teach.Throws<ArgumentOutOfRangeException>(() => map.Reserve(0, 1),
            "Rows are 1-based, so 0 is outside the map - reread README ex7.");
        Teach.Throws<ArgumentOutOfRangeException>(() => map.Reserve(3, 1), "...and so is row 3.");
        Teach.Throws<ArgumentOutOfRangeException>(() => map.Reserve(1, 0), "Seats likewise.");
        Teach.Throws<ArgumentOutOfRangeException>(() => map.IsReserved(1, 4),
            "...and the query method validates too, rather than reading a neighbouring row.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new SeatMap(0, 3), "A map needs a row...");
        Teach.Throws<ArgumentOutOfRangeException>(() => new SeatMap(3, 0), "...and a seat.");
    }

    [Fact]
    public void Ex8_AFluentBuilder()
    {
        UrlBuilder builder = new UrlBuilder();
        Teach.True(ReferenceEquals(builder, builder.Host("example.com")),
            "Each step returns THIS builder - that is what makes the chain work, and it means "
                + "no copies are made along the way - reread README ex8.");

        Teach.Equal("https://example.com", new UrlBuilder().Host("example.com").Build(),
            "A host alone has no trailing slash - reread README ex8.");
        Teach.Equal("https://example.com/a/b",
            new UrlBuilder().Host("example.com").Path("a").Path("b").Build(),
            "Segments join in the order they were added.");
        Teach.Equal("https://example.com/a",
            new UrlBuilder().Host("example.com").Path("/a/").Build(),
            "Each segment is stripped of its own slashes, so the caller may write them or not "
                + "- reread README ex8.");
        Teach.Equal("https://x?b=2&a=1",
            new UrlBuilder().Host("x").Query("b", "2").Query("a", "1").Build(),
            "The first parameter takes '?', the rest take '&', and the order is the order they "
                + "were added - reread README ex8.");
        Teach.Equal("https://x?a=2",
            new UrlBuilder().Host("x").Query("a", "1").Query("a", "2").Build(),
            "A repeated key REPLACES rather than appending a second copy - reread README ex8.");
        Teach.Equal("https://x/p?k=v",
            new UrlBuilder().Host("x").Path("p").Query("k", "v").Build(),
            "Path first, then query - whatever order the calls came in.");

        Teach.Throws<InvalidOperationException>(() => new UrlBuilder().Build(),
            "Building without a host is a problem with the builder's STATE, not with an "
                + "argument - which is exactly what InvalidOperationException is for "
                + "- reread README ex8.");
        Teach.Throws<ArgumentException>(() => new UrlBuilder().Host(" "), "A blank host is not a host.");
        Teach.Throws<ArgumentException>(() => new UrlBuilder().Host("x").Path("  "),
            "Nor is a blank segment a segment.");
        Teach.Throws<ArgumentException>(() => new UrlBuilder().Host("x").Query("", "v"),
            "Nor is a blank key a key.");
    }
}
