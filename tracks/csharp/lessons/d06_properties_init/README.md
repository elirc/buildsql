# d06 - Properties and initialisation drills

Eight problems on the members that look like fields and behave like methods:
private setters, computed properties, `init`, `required`, guarded setters,
caching, validation inside an init accessor, and an indexer. They drill lesson
03 - reread `03_classes_objects` if `{ get; private set; }` is not yet
automatic.

Every file lives in `src/Lessons/D06_PropertiesInit/`. Nothing here depends on
anything else here.

## Exercise 1 - a private setter

`Battery(capacityMah)` with `ChargeMah { get; private set; }`, computed
`Percent` (rounded to a whole number, halves away from zero) and `IsFull`, plus
`Charge` and `Drain` which clamp at capacity and at zero and reject negative
amounts.

Edit `src/Lessons/D06_PropertiesInit/Ex1.cs`.

```
uv run dojo test csharp d06_properties_init ex1
```

## Exercise 2 - init-only properties

`Invoice` has `Number`, `Subtotal` and `TaxRate` set through an object
initialiser, and three computed members: `Tax` (2 dp, halves away from zero),
`Total` (which must use the rounded tax) and `Label` (`"INV-1: 120.00"`).

Edit `src/Lessons/D06_PropertiesInit/Ex2.cs`.

```
uv run dojo test csharp d06_properties_init ex2
```

## Exercise 3 - required members

`MailMessage` has `required To` and `required Subject`, an optional `Body`
defaulting to `""`, and two computed members: `HasBody` and `Summary`
(`"To: ada@example.com | Hello (5 chars)"`).

Edit `src/Lessons/D06_PropertiesInit/Ex3.cs`.

```
uv run dojo test csharp d06_properties_init ex3
```

## Exercise 4 - a property with a body

`VolumeControl.Level` clamps to 0-100 rather than throwing, and setting it
unmutes. `Mute()` and `Unmute()` change `Muted` without forgetting the level,
and `Effective` is 0 while muted and `Level` otherwise.

Edit `src/Lessons/D06_PropertiesInit/Ex4.cs`.

```
uv run dojo test csharp d06_properties_init ex4
```

## Exercise 5 - computed every time, or computed once

`Basket.Total` adds the prices up on every read. `Basket.CachedTotal` does it
at most once between changes, and `TotalComputations` counts how often it
really added. `Add` must leave both answers correct.

Edit `src/Lessons/D06_PropertiesInit/Ex5.cs`.

```
uv run dojo test csharp d06_properties_init ex5
```

## Exercise 6 - a setter that refuses

`Password.Value` throws `ArgumentException` for null or anything under 8
characters, and a refused assignment leaves the previous value in place.
`Strength` scores one point each for length >= 12, a digit, an upper-case
letter, and a character that is neither letter nor digit; `IsStrong` is 3 or
more.

Edit `src/Lessons/D06_PropertiesInit/Ex6.cs`.

```
uv run dojo test csharp d06_properties_init ex6
```

## Exercise 7 - validation in an init accessor

`Reservation` has `required Name` and a `required Guests` whose **init
accessor** rejects anything below 1 with `ArgumentOutOfRangeException`, an
optional `Note`, a `Describe` property, and `WithGuests(n)` returning a new
reservation that keeps the name and note and revalidates.

Edit `src/Lessons/D06_PropertiesInit/Ex7.cs`.

```
uv run dojo test csharp d06_properties_init ex7
```

## Exercise 8 - an indexer over defaults and overrides

`Settings(defaults)` copies the defaults. `settings[key]` reads the override,
then the default, then `""`. Assigning stores an override - unless the value
equals the default, in which case it clears the override instead. `IsModified`,
`ModifiedKeys` (sorted ordinally), `Reset(key)` and `ResetAll()` complete it.

Edit `src/Lessons/D06_PropertiesInit/Ex8.cs`.

```
uv run dojo test csharp d06_properties_init ex8
```

## The gate

This is the entire gate class, `tests/Gates/D06_PropertiesInitTests.cs`:

```csharp
using CSharpDojo.D06_PropertiesInit;

namespace CSharpDojo.Gates;

public class D06_PropertiesInitTests
{
    [Fact]
    public void Ex1_APrivateSetterAndTwoComputedProperties()
    {
        Battery battery = new Battery(2000);

        Teach.Equal(2000, battery.CapacityMah, "The capacity is what was asked for.");
        Teach.Equal(0, battery.ChargeMah, "A new battery is flat.");
        Teach.Equal(0, battery.Percent, "...and reads 0%.");
        Teach.True(!battery.IsFull, "...and is not full.");

        battery.Charge(500);
        Teach.Equal(500, battery.ChargeMah, "Charging adds.");
        Teach.Equal(25, battery.Percent, "500 of 2000 is 25%.");

        battery.Charge(5000);
        Teach.Equal(2000, battery.ChargeMah,
            "Charge CLAMPS at capacity rather than overflowing - reread README ex1.");
        Teach.Equal(100, battery.Percent, "...so it reads 100%.");
        Teach.True(battery.IsFull, "...and it is full.");

        battery.Drain(1500);
        Teach.Equal(500, battery.ChargeMah, "Draining subtracts.");
        battery.Drain(9999);
        Teach.Equal(0, battery.ChargeMah, "...and clamps at zero, never going negative.");

        Battery odd = new Battery(3);
        odd.Charge(1);
        Teach.Equal(33, odd.Percent,
            "1 of 3 is 33.33%, which rounds to 33 - and the division must happen in double, "
                + "not in int - reread README ex1.");
        odd.Charge(1);
        Teach.Equal(67, odd.Percent,
            "2 of 3 is 66.67%, which rounds UP to 67. Truncation would say 66.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new Battery(0), "A battery holds something.");
        Teach.Throws<ArgumentOutOfRangeException>(() => battery.Charge(-1),
            "Charging by a negative amount is a caller bug, not a sneaky way to drain "
                + "- reread README ex1.");
        Teach.Throws<ArgumentOutOfRangeException>(() => battery.Drain(-1), "And the same for draining.");
    }

    [Fact]
    public void Ex2_InitOnlyPropertiesAndObjectInitialisers()
    {
        Invoice invoice = new Invoice { Number = "INV-1", Subtotal = 100m, TaxRate = 0.2m };

        Teach.Equal("INV-1", invoice.Number, "Set in the object initialiser - reread README ex2.");
        Teach.Equal(20.00m, invoice.Tax, "20% of 100.");
        Teach.Equal(120.00m, invoice.Total, "Subtotal plus tax.");
        Teach.Equal("INV-1: 120.00", invoice.Label,
            "The label always shows two decimals, which is a FORMAT choice and not a rounding "
                + "one - reread README ex2.");

        Invoice awkward = new Invoice { Number = "INV-2", Subtotal = 19.99m, TaxRate = 0.175m };
        Teach.Equal(3.50m, awkward.Tax,
            "19.99 x 0.175 is 3.49825, and rounding to 2 places with halves away from zero "
                + "gives 3.50 - reread README ex2.");
        Teach.Equal(23.49m, awkward.Total, "...and the total uses the ROUNDED tax, not the raw one.");

        Invoice free = new Invoice { Number = "INV-3" };
        Teach.Equal(0m, free.Tax, "Both amounts default to 0, so there is no tax...");
        Teach.Equal(0m, free.Total, "...and no total.");
        Teach.Equal("INV-3: 0.00", free.Label, "...and the label still formats.");
    }

    [Fact]
    public void Ex3_RequiredMembers()
    {
        MailMessage message = new MailMessage
        {
            To = "ada@example.com",
            Subject = "Hello",
            Body = "hi",
        };

        Teach.True(message.HasBody, "There is body text - reread README ex3.");
        Teach.Equal("To: ada@example.com | Hello (2 chars)", message.Summary,
            "The summary reads all three properties - reread README ex3.");

        MailMessage bare = new MailMessage { To = "bo@example.com", Subject = "Ping" };
        Teach.True(!bare.HasBody,
            "Body was not set, so it is the initialiser's \"\" rather than null - which is why "
                + "HasBody can read .Length without a null check - reread README ex3.");
        Teach.Equal("To: bo@example.com | Ping (0 chars)", bare.Summary,
            "...and the summary says zero characters.");
        Teach.Equal("", bare.Body, "The default really is the empty string.");
    }

    [Fact]
    public void Ex4_APropertyWithABodyAndDerivedState()
    {
        VolumeControl volume = new VolumeControl();

        Teach.Equal(50, volume.Level, "The field initialiser sets the starting level.");
        Teach.Equal(50, volume.Effective, "Not muted, so what you set is what you hear.");
        Teach.True(!volume.Muted, "A new control is not muted.");

        volume.Level = 80;
        Teach.Equal(80, volume.Level, "An in-range value is stored as it is.");

        volume.Level = 300;
        Teach.Equal(100, volume.Level,
            "Out of range is CLAMPED here rather than rejected - a volume knob does not throw "
                + "- reread README ex4.");
        volume.Level = -20;
        Teach.Equal(0, volume.Level, "...at both ends.");

        volume.Level = 60;
        volume.Mute();
        Teach.True(volume.Muted, "Muted now.");
        Teach.Equal(60, volume.Level,
            "Muting does NOT forget the level - that is the whole point of having two "
                + "properties - reread README ex4.");
        Teach.Equal(0, volume.Effective, "...but nothing comes out.");

        volume.Unmute();
        Teach.Equal(60, volume.Effective, "Unmuting brings the same level back.");

        volume.Mute();
        volume.Level = 30;
        Teach.True(!volume.Muted,
            "Setting a level while muted unmutes - reaching for the knob means you want to "
                + "hear something - reread README ex4.");
        Teach.Equal(30, volume.Effective, "...at the new level.");
    }

    [Fact]
    public void Ex5_ComputedEveryTimeOrComputedOnce()
    {
        Basket basket = new Basket();
        basket.Add(1.50m);
        basket.Add(2.25m);

        Teach.Equal(2, basket.Count, "Two prices.");
        Teach.Equal(3.75m, basket.Total, "The plain total adds them up.");
        Teach.Equal(3.75m, basket.Total, "...and again.");
        Teach.Equal(0, basket.TotalComputations,
            "Reading Total twice did not touch the cache at all - reread README ex5.");

        Teach.Equal(3.75m, basket.CachedTotal, "The cached total agrees...");
        Teach.Equal(3.75m, basket.CachedTotal, "...and agrees again...");
        Teach.Equal(1, basket.TotalComputations,
            "...but only added the prices up ONCE. If this is 2, the cache is being written "
                + "but never read - reread README ex5.");

        basket.Add(1.00m);
        Teach.Equal(4.75m, basket.Total, "The plain total is always current.");
        Teach.Equal(4.75m, basket.CachedTotal,
            "...and the cached one must be too: Add has to invalidate the cache, or the basket "
                + "quietly under-charges - reread README ex5.");
        Teach.Equal(2, basket.TotalComputations, "One recomputation after the change...");
        Teach.Equal(4.75m, basket.CachedTotal, "...and the next read is cached again.");
        Teach.Equal(2, basket.TotalComputations, "...so still two.");
    }

    [Fact]
    public void Ex6_ASetterThatRefusesAndAScoreThatFollows()
    {
        Password password = new Password();

        Teach.Equal("", password.Value, "It starts empty...");
        Teach.Equal(0, password.Strength, "...and an empty password scores nothing.");

        password.Value = "password";
        Teach.Equal(0, password.Strength,
            "Eight lower-case letters: not long enough for the length point, and no digit, "
                + "capital or symbol - reread README ex6.");
        Teach.True(!password.IsStrong, "...so it is not strong.");

        password.Value = "Password1";
        Teach.Equal(2, password.Strength, "A capital and a digit, but still under 12.");
        Teach.True(!password.IsStrong, "Two is not three.");

        password.Value = "Password1!";
        Teach.Equal(3, password.Strength, "Add a symbol and it reaches 3.");
        Teach.True(password.IsStrong, "...which is the threshold.");

        password.Value = "correcthorsebattery";
        Teach.Equal(1, password.Strength,
            "Nineteen characters earns the length point and nothing else - length alone is not "
                + "strength in this scheme - reread README ex6.");

        password.Value = "Correct-Horse-9";
        Teach.Equal(4, password.Strength, "Long, a digit, a capital and a hyphen: all four.");

        Teach.Throws<ArgumentException>(() => password.Value = "short",
            "Under 8 characters is refused by the SETTER, so the object can never hold one "
                + "- reread README ex6.");
        Teach.Equal("Correct-Horse-9", password.Value,
            "...and a refused assignment leaves the old value untouched: throw BEFORE you "
                + "assign - reread README ex6.");
        Teach.Throws<ArgumentException>(() => password.Value = null!, "Null is refused too.");
    }

    [Fact]
    public void Ex7_ValidationInsideAnInitAccessor()
    {
        Reservation booking = new Reservation { Name = "Ada", Guests = 2 };

        Teach.Equal(2, booking.Guests, "The init accessor stored the value - reread README ex7.");
        Teach.Equal("Ada for 2", booking.Describe, "No note, so no bracket.");

        Reservation noted = new Reservation { Name = "Ada", Guests = 2, Note = "window" };
        Teach.Equal("Ada for 2 (window)", noted.Describe, "With a note, it is appended in brackets.");

        Teach.Throws<ArgumentOutOfRangeException>(
            () => new Reservation { Name = "Ada", Guests = 0 },
            "Zero guests is refused DURING construction, so a bad Reservation never exists - "
                + "which a constructor-free type can only achieve inside the init accessor "
                + "- reread README ex7.");

        Reservation bigger = noted.WithGuests(4);
        Teach.Equal(4, bigger.Guests, "The copy has the new count...");
        Teach.Equal("Ada", bigger.Name, "...the same name...");
        Teach.Equal("window", bigger.Note ?? "", "...and the same note.");
        Teach.Equal(2, noted.Guests,
            "...and the ORIGINAL is untouched, because WithGuests built a new object rather "
                + "than editing this one - reread README ex7.");

        Teach.Throws<ArgumentOutOfRangeException>(() => noted.WithGuests(0),
            "The copy goes through the same init accessor, so it gets the same validation for "
                + "free - reread README ex7.");
    }

    [Fact]
    public void Ex8_AnIndexerOverDefaultsAndOverrides()
    {
        Dictionary<string, string> shipped = new Dictionary<string, string>
        {
            ["theme"] = "light",
            ["lang"] = "en",
        };
        Settings settings = new Settings(shipped);
        shipped["theme"] = "HACKED";

        Teach.Equal("light", settings["theme"],
            "The defaults were copied, so editing the caller's dictionary afterwards changes "
                + "nothing - reread README ex8.");
        Teach.Equal("", settings["nosuchkey"],
            "An unknown key reads as \"\" rather than throwing - reread README ex8.");
        Teach.True(!settings.IsModified, "Nothing has been changed yet.");

        settings["theme"] = "dark";
        Teach.Equal("dark", settings["theme"], "The override wins over the default.");
        Teach.True(settings.IsModified, "...and the setting counts as modified.");
        Teach.Equal("theme", string.Join(", ", settings.ModifiedKeys), "...by name.");

        settings["theme"] = "light";
        Teach.Equal("light", settings["theme"], "Setting it back to the default reads the same...");
        Teach.True(!settings.IsModified,
            "...and CLEARS the override rather than storing a redundant one, so the settings "
                + "screen stops showing a change that is not a change - reread README ex8.");

        settings["lang"] = "fr";
        settings["theme"] = "dark";
        settings["extra"] = "on";
        Teach.Equal("extra, lang, theme", string.Join(", ", settings.ModifiedKeys),
            "Three overrides, sorted ordinally - and a key with no default is still a perfectly "
                + "good override - reread README ex8.");

        settings.Reset("lang");
        Teach.Equal("en", settings["lang"], "Resetting one falls back to its default...");
        Teach.Equal("extra, theme", string.Join(", ", settings.ModifiedKeys), "...and drops out.");
        settings.Reset("neverset");
        Teach.Equal("extra, theme", string.Join(", ", settings.ModifiedKeys),
            "Resetting something that was never overridden is a no-op, not an error.");

        settings.ResetAll();
        Teach.True(!settings.IsModified, "ResetAll drops the lot...");
        Teach.Equal("light", settings["theme"], "...and every key is back to its default.");
    }
}
```
