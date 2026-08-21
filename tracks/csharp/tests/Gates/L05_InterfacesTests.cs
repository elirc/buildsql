using CSharpDojo.L05_Interfaces;

namespace CSharpDojo.Gates;

public class L05_InterfacesTests
{
    [Fact]
    public void Ex1_OneContractCoversTwoUnrelatedTypes()
    {
        Book book = new Book("Dune", 12.50m);
        Subscription news = new Subscription("news", 4m, 3);

        Teach.Equal("\"Dune\"", book.Label,
            "A book's label is its title wrapped in double quotes - escape them as \\\" inside "
                + "a C# string - reread README ex1.");
        Teach.Equal("news x3", news.Label,
            "A subscription's label is the service, an x, and the number of months.");
        Teach.Equal(12m, news.Price,
            "Price is the WHOLE subscription: 4 a month for 3 months is 12. The interface asked "
                + "for a price, and each type decides what that means - reread README ex1.");

        List<IPriced> basket = new List<IPriced> { book, news };

        Teach.Equal(24.50m, Basket.Total(basket),
            "12.50 plus 12 is 24.50. Total never mentions Book or Subscription: it only knows "
                + "IPriced - reread README ex1.");
        Teach.Equal(0m, Basket.Total(new List<IPriced>()),
            "An empty basket costs nothing.");
    }

    [Fact]
    public void Ex2_ExplicitImplementationsGiveTwoAnswers()
    {
        Bilingual person = new Bilingual();

        Teach.Equal("hello", ((IEnglish)person).Greet(),
            "Through IEnglish, Greet says \"hello\". One class, two contracts, two "
                + "implementations - reread README ex2.");

        Teach.Equal("bonjour", ((IFrench)person).Greet(),
            "Through IFrench, the same object says \"bonjour\". If both calls give the same "
                + "answer you still have one method implementing both interfaces implicitly - "
                + "reread README ex2.");

        Teach.True(person is IEnglish && person is IFrench,
            "Bilingual must still declare BOTH interfaces. Explicit implementation changes how "
                + "the members are reached, not what the class promises.");
    }

    [Fact]
    public void Ex3_DefaultMethodsAreInheritedUnlessReplaced()
    {
        IAuditEvent login = new LoginEvent("ada");

        Teach.Equal("ada performed login", login.Describe(),
            "LoginEvent writes no Describe at all - it takes the default implementation from "
                + "the interface, which reads the two properties - reread README ex3.");

        IAuditEvent admin = new AdminEvent("root", "delete-user");

        Teach.Equal("[ADMIN] root performed delete-user", admin.Describe(),
            "AdminEvent supplies its own Describe, which wins over the interface's default - "
                + "reread README ex3.");

        Teach.Equal("login", login.Action,
            "Action is an ordinary property on the implementer; only Describe has a default.");
    }

    private sealed class FixedClock : IClock
    {
        public DateTime Now => new DateTime(2026, 8, 20);
    }

    private sealed class TenOff : IDiscountPolicy
    {
        public decimal Apply(decimal amount) => amount - 10m;
    }

    private sealed class NoDiscount : IDiscountPolicy
    {
        public decimal Apply(decimal amount) => amount;
    }

    [Fact]
    public void Ex4_CheckoutUsesWhateverItWasGiven()
    {
        Checkout discounted = new Checkout(new FixedClock(), new TenOff());

        Teach.Equal("2026-08-20: 90", discounted.Receipt(100m),
            "The date comes from the injected clock (never DateTime.Now) and the amount from "
                + "the injected policy, which here takes 10 off - reread README ex4.");

        Checkout plain = new Checkout(new FixedClock(), new NoDiscount());

        Teach.Equal("2026-08-20: 100", plain.Receipt(100m),
            "Same Checkout code, a different policy object, a different answer - and Checkout "
                + "needed no changes at all. That is what depending on an interface buys you.");

        Teach.Equal("2026-08-20: 40", discounted.Receipt(50m),
            "The collaborators are stored once in the constructor and reused on every call.");
    }

    [Fact]
    public void Challenge_SemVerTeachesTheFrameworkHowToSortIt()
    {
        SemVer one = new SemVer(1, 2, 3);
        SemVer same = new SemVer(1, 2, 3);

        Teach.Equal(0, one.CompareTo(same),
            "Equal versions compare to 0 - and note that CompareTo says \"same order\", not "
                + "\"same object\" - reread README challenge.");

        Teach.True(new SemVer(1, 9, 9).CompareTo(new SemVer(2, 0, 0)) < 0,
            "1.9.9 sorts before 2.0.0: major wins outright, whatever the other parts say - "
                + "reread README challenge.");

        Teach.True(new SemVer(1, 2, 10).CompareTo(new SemVer(1, 2, 9)) > 0,
            "Compare the parts as NUMBERS: 10 is after 9, though \"10\" sorts before \"9\" as "
                + "text. Comparing the ToString values is the classic wrong answer here.");

        Teach.True(one.CompareTo(null) > 0,
            "By convention every object sorts after null, so CompareTo(null) is positive.");

        List<SemVer> versions = new List<SemVer>
        {
            new SemVer(2, 0, 0), new SemVer(1, 2, 3), new SemVer(1, 0, 0), new SemVer(1, 2, 0),
        };
        versions.Sort();

        Teach.Equal("1.0.0, 1.2.0, 1.2.3, 2.0.0", string.Join(", ", versions),
            "List<T>.Sort found your CompareTo through IComparable<T> - you wrote no sorting "
                + "code at all. string.Join calls ToString on each item, which is the other "
                + "half of this exercise - reread README challenge.");
    }

    [Fact]
    public void Review1_TheOrderDoesNotKnowWhichRateItHas()
    {
        Teach.Equal(5m, new FlatRate(5m).For(20000),
            "A flat rate ignores the weight entirely.");

        Teach.Equal(2m, new ByWeight().For(0),
            "Nothing weighs less than the minimum charge of 2.");
        Teach.Equal(2m, new ByWeight().For(1000),
            "Exactly one kilogram is one kilogram, not two - watch the boundary.");
        Teach.Equal(4m, new ByWeight().For(1001),
            "One gram over rounds UP to the next whole kilogram: 4. Integer division alone "
                + "rounds down, so this needs a deliberate rounding up.");

        Order flat = new Order(new FlatRate(5m));
        Order weighed = new Order(new ByWeight());

        Teach.Equal(35m, flat.TotalFor(30m, 1500),
            "Goods plus shipping, with the flat policy.");
        Teach.Equal(34m, weighed.TotalFor(30m, 1500),
            "The same order, the same Order class, a different injected policy - reread README "
                + "review.");
    }
}
