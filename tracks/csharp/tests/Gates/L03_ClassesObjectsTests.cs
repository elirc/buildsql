using CSharpDojo.L03_ClassesObjects;

namespace CSharpDojo.Gates;

public class L03_ClassesObjectsTests
{
    [Fact]
    public void Ex1_AccountProtectsItsOwnBalance()
    {
        Account account = new Account("Ada");

        Teach.Equal("Ada", account.Owner,
            "The constructor's job is to put the object into a usable state - Owner comes from "
                + "its parameter - reread README ex1.");
        Teach.Equal(0m, account.Balance,
            "A brand new account holds nothing. A decimal field starts at 0 on its own, but the "
                + "constructor is where you say so out loud.");

        account.Deposit(50m);
        Teach.Equal(50m, account.Balance, "Deposit adds to the balance.");

        Teach.True(account.Withdraw(20m),
            "A withdrawal the balance can cover succeeds and returns true.");
        Teach.Equal(30m, account.Balance, "50 in, 20 out, 30 left.");

        Teach.True(!account.Withdraw(1000m),
            "There is only 30 in the account, so this withdrawal must be refused - return false "
                + "rather than throwing - reread README ex1.");
        Teach.Equal(30m, account.Balance,
            "A refused withdrawal must change NOTHING. If the balance moved, you subtracted "
                + "before you checked - reread README ex1.");

        Teach.Throws<ArgumentOutOfRangeException>(() => account.Deposit(-5m),
            "A negative deposit is not an ordinary outcome, it is a caller bug: throw "
                + "ArgumentOutOfRangeException. Note the difference from the refused withdrawal, "
                + "which is an ordinary outcome - reread README ex1.");
    }

    [Fact]
    public void Ex2_LessonCardComputesFromItsInitOnlyData()
    {
        LessonCard generics = new LessonCard { Slug = "07_generics", Exercises = 4, HasChallenge = true };

        Teach.Equal(5, generics.TotalExercises,
            "Four core exercises plus one challenge is five - reread README ex2.");
        Teach.Equal("07_generics: 4 exercises + challenge", generics.Display,
            "Display reads its own properties; it stores nothing - reread README ex2.");

        LessonCard hello = new LessonCard { Slug = "00_hello_dojo", Exercises = 3 };

        Teach.Equal(3, hello.TotalExercises,
            "HasChallenge was never set in the object initialiser, so it is the default false, "
                + "and a bool default is false - not an error.");
        Teach.Equal("00_hello_dojo: 3 exercises", hello.Display,
            "With no challenge the \" + challenge\" half disappears entirely.");

        LessonCard single = new LessonCard { Slug = "23_transactions", Exercises = 1, HasChallenge = true };

        Teach.Equal("23_transactions: 1 exercise + challenge", single.Display,
            "One exercise is an \"exercise\" - the same pluralisation decision as lesson 00 ex2.");
    }

    [Fact]
    public void Ex3_SerialsComeFromSharedStaticState()
    {
        Robot.Reset();
        Teach.Equal(0, Robot.Built, "Reset puts the shared counter back to zero - reread README ex3.");

        Robot first = new Robot();
        Robot second = new Robot();
        Robot third = new Robot();

        Teach.Equal(1, first.Serial, "The first robot built gets serial 1, not 0 - increment "
            + "the counter before you read it.");
        Teach.Equal(2, second.Serial, "Serial is INSTANCE state: each robot keeps its own.");
        Teach.Equal(3, third.Serial, "Three robots, three different serials.");
        Teach.Equal(3, Robot.Built, "Built is STATIC state: one counter shared by the whole type "
            + "- reread README ex3.");

        Robot.Reset();
        Teach.Equal(0, Robot.Built, "Reset clears the counter...");
        Teach.Equal(1, first.Serial, "...but the robots already built keep the serial they were "
            + "given. Their instance state is not shared with anyone.");
    }

    [Fact]
    public void Ex4_CelsiusClampsAndFahrenheitConverts()
    {
        Thermostat thermostat = new Thermostat();

        Teach.Equal(20, thermostat.Celsius,
            "The field initialiser sets 20, and the getter hands the field back - reread README ex4.");
        Teach.Equal(68, thermostat.Fahrenheit,
            "20C is 68F: multiply by 9, divide by 5, add 32. Doing that in ints alone loses "
                + "the fraction before you round it.");

        thermostat.Celsius = 100;
        Teach.Equal(30, thermostat.Celsius,
            "100 is above Maximum, so the SETTER clamps it to 30 on the way in. The caller is "
                + "not told - reread README ex4.");

        thermostat.Celsius = -50;
        Teach.Equal(5, thermostat.Celsius, "And -50 clamps up to Minimum.");

        thermostat.Celsius = 21;
        Teach.Equal(70, thermostat.Fahrenheit,
            "21C is 69.8F, which rounds to 70. Fahrenheit is computed on demand, so it followed "
                + "the new setting without anyone updating it.");
    }

    [Fact]
    public void Challenge_CartOwnsItsItems()
    {
        ShoppingCart cart = new ShoppingCart();
        cart.Add("widget", 2.50m, 2);
        cart.Add("cable", 10m, 1);

        Teach.Equal(2, cart.Items.Count, "Two distinct products, two lines.");
        Teach.Equal(3, cart.ItemCount, "ItemCount counts units - two widgets and one cable is "
            + "three - reread README challenge.");
        Teach.Equal(15m, cart.Total, "2 x 2.50 plus 1 x 10.00 is 15.00.");

        cart.Add("widget", 2.50m, 3);
        Teach.Equal(2, cart.Items.Count, "Adding a product already in the cart must MERGE into "
            + "the existing line rather than appending a second one - reread README challenge.");
        Teach.Equal(6, cart.ItemCount, "Five widgets and one cable.");
        Teach.Equal(22.50m, cart.Total, "5 x 2.50 plus 10.00 is 22.50.");

        Teach.True(cart.Items is not List<CartItem>,
            "Items must not hand out the private List itself: a caller can cast an "
                + "IReadOnlyList<T> back to List<T> and then Add to your internals. Return a "
                + "wrapper (AsReadOnly()) instead - reread README challenge.");

        Teach.True(cart.Remove("cable"), "Removing a line that exists returns true.");
        Teach.Equal(12.50m, cart.Total, "With the cable gone, only the widgets are left.");
        Teach.True(!cart.Remove("nonesuch"), "Removing something that was never there is false, "
            + "not an exception.");

        Teach.Throws<ArgumentOutOfRangeException>(() => cart.Add("ghost", 1m, 0),
            "Adding zero units is a caller bug - guard it the way Account.Deposit does.");
    }

    [Fact]
    public void Review1_ScoreboardKeepsInstanceAndStaticStateApart()
    {
        Scoreboard.Reset();

        Scoreboard home = new Scoreboard("Home");
        Scoreboard away = new Scoreboard("Away");

        Teach.Equal("Home", home.Team, "The constructor stores the team name.");
        Teach.Equal(2, Scoreboard.Created, "Created is static: both constructions increment the "
            + "one counter.");

        home.Add(3);
        home.Add(4);

        Teach.Equal(7, home.Points, "Points accumulate on the instance you called Add on.");
        Teach.Equal(0, away.Points, "The other scoreboard has its own Points and did not move.");

        Teach.Throws<ArgumentOutOfRangeException>(() => away.Add(-1),
            "A negative award breaks the invariant this class exists to protect: throw "
                + "ArgumentOutOfRangeException.");
        Teach.Equal(0, away.Points, "And the refused award left the state alone.");
    }
}
