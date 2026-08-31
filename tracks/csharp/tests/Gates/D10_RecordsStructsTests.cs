using CSharpDojo.D10_RecordsStructs;

namespace CSharpDojo.Gates;

public class D10_RecordsStructsTests
{
    [Fact]
    public void Ex1_WhatOneLineOfRecordGivesYou()
    {
        Employee ada = new Employee("Ada", "Eng", 3);

        Teach.Equal("Ada works in Eng at level 3", Staff.Describe(ada),
            "Deconstruction gives you three named locals in one line - a positional record "
                + "generates the Deconstruct for you - reread README ex1.");

        Teach.Equal("Employee { Name = Ada, Department = Eng, Level = 3 }", Staff.Print(ada),
            "That ToString is generated, not written: type name, then every component "
                + "- reread README ex1.");

        Employee twin = new Employee("Ada", "Eng", 3);
        Teach.True(Staff.SamePerson(ada, twin),
            "Two records holding the same data are EQUAL - value semantics, for free "
                + "- reread README ex1.");
        Teach.True(!ReferenceEquals(ada, twin),
            "...even though they are two different objects. A record is still a class.");
        Teach.True(!Staff.SamePerson(ada, new Employee("Ada", "Eng", 4)),
            "One component different means not equal.");
        Teach.Equal(ada.GetHashCode(), twin.GetHashCode(),
            "Value equality brings a matching GetHashCode with it, so records work as "
                + "dictionary keys without any work from you.");
    }

    [Fact]
    public void Ex2_WithAndWhatFollowsIt()
    {
        Booking booking = new Booking("Ada", 2, 100);

        Teach.Equal(200, booking.Total, "2 nights at 100.");
        Teach.Equal("Ada x2", booking.Label, "The label reads two components.");

        Booking longer = Bookings.Extend(booking, 3);
        Teach.Equal(5, longer.Nights, "Two nights plus three.");
        Teach.Equal(500, longer.Total,
            "The computed property follows the copy: `with` produced a new object and Total "
                + "is worked out from its components - reread README ex2.");
        Teach.Equal("Ada x5", longer.Label, "...and so does the label.");

        Teach.Equal(2, booking.Nights,
            "The ORIGINAL is untouched - `with` copies, it never edits - reread README ex2.");
        Teach.Equal(200, booking.Total, "...so its total is unchanged too.");

        Teach.Equal(300, Bookings.Reprice(booking, 150).Total, "Same nights, new rate.");

        Booking same = Bookings.Extend(booking, 0);
        Teach.True(same == booking,
            "A copy with nothing changed is EQUAL to the original, because records compare by "
                + "value - reread README ex2.");
        Teach.True(!ReferenceEquals(same, booking), "...and is still a different object.");

        Teach.Throws<ArgumentOutOfRangeException>(() => Bookings.Extend(booking, -1),
            "Validation still belongs somewhere - `with` performs no checks of its own "
                + "- reread README ex2.");
    }

    [Fact]
    public void Ex3_AReadonlyStructThatReturnsNewCopies()
    {
        Rgb orange = new Rgb(255, 128, 0);

        Teach.Equal("#FF8000", orange.Hex,
            "Two upper-case hex digits per channel - reread README ex3.");
        Teach.Equal("#FF8000", orange.ToString(), "ToString says the same thing.");
        Teach.Equal("#000000", new Rgb(0, 0, 0).Hex, "Black pads to six digits.");
        Teach.Equal("#FFFFFF", new Rgb(255, 255, 255).Hex, "And white is all Fs.");

        Rgb darker = orange.Darken(200);
        Teach.Equal("#370000", darker.Hex,
            "255 - 200 is 55 (0x37), and the other two channels stop at 0 rather than "
                + "wrapping round to 255 - reread README ex3.");
        Teach.Equal("#FF8000", orange.Hex,
            "The original is unchanged: a readonly struct cannot be edited, so Darken had to "
                + "build a NEW one - reread README ex3.");
        Teach.Equal("#FF8000", orange.Darken(0).Hex, "Darkening by nothing changes nothing.");
    }

    [Fact]
    public void Ex4_RecordsInheritAndWithKnowsIt()
    {
        Truck truck = new Truck("AB12", 6, 12);

        Teach.Equal("Truck { Plate = AB12, Wheels = 6, PayloadTonnes = 12 }", truck.ToString(),
            "The generated ToString names the DERIVED type and lists the base's components "
                + "first - reread README ex4.");

        Vehicle asVehicle = truck;
        Vehicle copy = Fleet.Replate(asVehicle, "XY99");

        Teach.Equal("XY99", copy.Plate, "The copy has the new plate...");
        Teach.Equal("AB12", asVehicle.Plate, "...and the original still has the old one.");
        Teach.True(copy is Truck,
            "`with` on a Vehicle-typed variable holding a Truck produces a TRUCK: the copy "
                + "constructor is virtual, so nothing is sliced off - reread README ex4.");
        Teach.Equal(12, Fleet.PayloadOf(copy),
            "...and the payload survived the copy, even though the code that made it only "
                + "knew about Vehicle - reread README ex4.");

        Teach.Equal(0, Fleet.PayloadOf(new Vehicle("CD34", 4)),
            "A plain vehicle carries no payload.");

        Teach.True(new Vehicle("AB12", 6) != (Vehicle)truck,
            "A Vehicle and a Truck with the same plate and wheels are NOT equal: record "
                + "equality compares the runtime type first - reread README ex4.");
    }

    [Fact]
    public void Ex5_RecordStructAndTheReadonlyOne()
    {
        Tally tally = new Tally(3, 1);

        Teach.Equal("3-1", Structs.Score(tally), "Deconstruction works on a record struct too.");

        Tally bumped = Structs.BumpWins(tally);
        Teach.Equal(4, bumped.Wins, "The RETURNED tally has the extra win...");
        Teach.Equal(3, tally.Wins,
            "...and the caller's is untouched, because a struct parameter is a COPY. The same "
                + "method on a class would have changed both - reread README ex5.");

        Teach.True(new Tally(3, 1) == tally,
            "A record struct gets == by value, which a plain struct does not - reread "
                + "README ex5.");

        Point point = new Point(2, 5);
        Teach.True(Structs.Mirror(point) == new Point(-2, 5),
            "`with` works on a readonly record struct exactly as it does on a record "
                + "- reread README ex5.");
        Teach.True(point == new Point(2, 5), "...and the original is unchanged.");

        Teach.True(default(Point) == new Point(0, 0),
            "A struct's default is its zeroed fields, and here that is a perfectly valid "
                + "point - which is NOT true of every struct (see ex6) - reread README ex5.");
    }

    [Fact]
    public void Ex6_EveryStructHasAConstructorYouDidNotWrite()
    {
        Currency usd = new Currency("usd");

        Teach.Equal("USD", usd.Code, "Normalised on the way in - reread README ex6.");
        Teach.Equal("USD", usd.Safe, "...and Safe just reads it.");
        Teach.True(!usd.IsDefault, "A constructed currency is not the default.");

        Currency nothing = default;
        Teach.True(nothing.Code is null,
            "`default` builds the struct by ZEROING it - your constructor never ran, so the "
                + "string reference is null even though nothing in the type allows that "
                + "- reread README ex6.");
        Teach.True(nothing.IsDefault, "...which is exactly what IsDefault detects.");
        Teach.Equal("???", nothing.Safe,
            "...and why a struct with reference fields needs a defensive reader - reread "
                + "README ex6.");

        Currency[] wallet = new Currency[1];
        Teach.True(wallet[0].IsDefault,
            "A new array of structs is full of defaults, so the same hole appears anywhere a "
                + "struct is created without `new` - reread README ex6.");

        Teach.Throws<ArgumentException>(() => new Currency("US"), "Two letters is not a code.");
        Teach.Throws<ArgumentException>(() => new Currency("USDD"), "Nor is four.");
        Teach.Throws<ArgumentException>(() => new Currency("12X"), "Nor are digits.");
        Teach.Throws<ArgumentException>(() => new Currency(null!), "Nor is nothing.");
    }

    [Fact]
    public void Ex7_AMutableStructBehindAnInterface()
    {
        Teach.Equal(2, Boxes.ViaLocal(),
            "A plain local: two increments, value 2. Nothing surprising yet - reread "
                + "README ex7.");

        Teach.Equal(2, Boxes.ViaInterface(),
            "Assigning a struct to an interface variable BOXES it - copies it onto the heap - "
                + "and every call then goes to that one box, so the increments accumulate "
                + "- reread README ex7.");

        Teach.Equal(0, Boxes.ViaCopyThenReadOriginal(),
            "Here is the bug. `ICounter boxed = counter;` copied the struct into a box, so "
                + "both increments landed on the COPY and the original local is still 0. The "
                + "assignment that lost your data looks like an ordinary assignment "
                + "- reread README ex7.");

        Teach.Equal(1, Boxes.ViaArrayElement(),
            "An array element is a variable, so Increment mutates it in place. The same line "
                + "against a List<T> would not even compile, because its indexer returns a "
                + "COPY - reread README ex7.");
    }

    [Fact]
    public void Ex8_NestedRecordsWithAndPositionalPatterns()
    {
        Person ada = new Person("Ada", new Address("Leeds", "UK"));

        Person moved = People.MoveCity(ada, "York");
        Teach.Equal("York", moved.Home.City, "The copy lives somewhere else...");
        Teach.Equal("UK", moved.Home.Country, "...in the same country...");
        Teach.Equal("Leeds", ada.Home.City,
            "...and the original is untouched, which needs the NESTED record rebuilt as well "
                + "- reread README ex8.");

        Person renamed = ada with { Name = "Ada L" };
        Teach.True(ReferenceEquals(renamed.Home, ada.Home),
            "`with` is a SHALLOW copy: the new person points at the very same Address object. "
                + "That is safe here only because Address is immutable - reread README ex8.");

        Teach.True(ada == new Person("Ada", new Address("Leeds", "UK")),
            "Record equality goes all the way down, because Address is a record too "
                + "- reread README ex8.");

        Teach.True(People.SameCountry(ada, new Person("Bo", new Address("Bath", "UK"))),
            "Same country, different city.");
        Teach.True(!People.SameCountry(ada, new Person("Bo", new Address("Paris", "France"))),
            "Different country.");

        Teach.Equal("UK", People.Classify(ada), "The first arm matches on the nested country.");
        Teach.Equal("Parisian", People.Classify(new Person("Bo", new Address("Paris", "France"))),
            "A nested positional pattern can match two components at once - reread README ex8.");
        Teach.Equal("long name",
            People.Classify(new Person("Bartholomew", new Address("Rome", "Italy"))),
            "A `when` guard is tried only after the pattern matches.");
        Teach.Equal("other", People.Classify(new Person("Bo", new Address("Rome", "Italy"))),
            "And the discard catches the rest.");
        Teach.Equal("UK", People.Classify(new Person("Bartholomew", new Address("Hull", "UK"))),
            "Arms are tried IN ORDER, so a long UK name is still \"UK\" - reread README ex8.");
    }
}
