using CSharpDojo.L04_InheritancePolymorphism;

namespace CSharpDojo.Gates;

public class L04_InheritancePolymorphismTests
{
    [Fact]
    public void Ex1_EachShapeKnowsItsOwnArea()
    {
        Shape rectangle = new Rectangle(3, 4);
        Shape circle = new Circle(2);

        Teach.Equal(12.0, rectangle.Area(),
            "A 3 x 4 rectangle has area 12 - reread README ex1.");

        Teach.Equal(12.5664, Math.Round(circle.Area(), 4),
            "A circle of radius 2 has area pi x 2 x 2 = 12.5664. Use Math.PI rather than a "
                + "typed-out 3.14 - reread README ex1.");

        Teach.Equal("rectangle", rectangle.Name,
            "Name comes from the base constructor, which each subclass calls with its own "
                + "word. The base class holds the state every shape shares.");

        Teach.Equal(24.0, new Rectangle(6, 4).Area(),
            "The formula reads the instance's own Width and Height, so a different rectangle "
                + "gives a different answer.");
    }

    [Fact]
    public void Ex2_ManagerReusesTheBaseCalculation()
    {
        Employee employee = new Employee("Ada", 60000m);
        Manager manager = new Manager("Grace", 60000m, 500m);

        Teach.Equal(5000m, employee.MonthlyPay(),
            "60000 a year is 5000 a month - reread README ex2.");

        Teach.Equal(5500m, manager.MonthlyPay(),
            "A manager earns the ordinary monthly pay plus the bonus. Call base.MonthlyPay() "
                + "rather than repeating the division - reread README ex2.");

        Teach.Equal("Grace", manager.Name,
            "Name is stored once, by the base constructor. If you added another Name field to "
                + "Manager you now have two, and they will disagree one day.");

        Employee asEmployee = manager;
        Teach.Equal(5500m, asEmployee.MonthlyPay(),
            "This is the whole point of virtual: the variable's type is Employee, but the "
                + "OBJECT is a Manager, and the object decides - reread README ex2.");

        Teach.Equal(4166.67m, new Employee("Bo", 50000m).MonthlyPay(),
            "50000 / 12 is 4166.666..., which rounds to 4166.67. Round to the cent, away from "
                + "zero.");
    }

    [Fact]
    public void Ex3_OverrideAndNewAreResolvedByDifferentThings()
    {
        Duck loud = new LoudDuck();
        Teach.Equal("QUACK", loud.Speak(),
            "LoudDuck OVERRIDES Speak, so a Duck-typed variable holding a LoudDuck still gets "
                + "the loud version: the runtime type decides - reread README ex3.");

        Duck sneaky = new SneakyDuck();
        Teach.Equal("quack", sneaky.Speak(),
            "SneakyDuck HIDES Speak with `new`, so a Duck-typed variable gets Duck's version. "
                + "The compiler decided this at compile time from the variable's type - "
                + "reread README ex3.");

        Teach.Equal("shh", ((SneakyDuck)sneaky).Speak(),
            "Cast the same object to SneakyDuck and the hidden method appears. One object, "
                + "two answers, depending only on how you were holding it. That is why `new` "
                + "is almost never what you want.");

        Teach.Equal("QUACK", ((LoudDuck)loud).Speak(),
            "An overridden method gives the same answer through either type - which is the "
                + "difference in one line.");
    }

    [Fact]
    public void Ex4_OneLoopRendersEveryKind()
    {
        List<Notification> outbox = new List<Notification>
        {
            new EmailNotification("ada@example.com", "Welcome"),
            new SmsNotification("07700900123", "Your code is 1234"),
            new EmailNotification("bo@example.com", "Receipt"),
        };

        Teach.Equal(
            "email to ada@example.com: Welcome | sms to 07700900123: Your code is 1234 | "
                + "email to bo@example.com: Receipt",
            Notifier.RenderAll(outbox),
            "RenderAll should call Render() on each item and join with \" | \". If you wrote "
                + "an `if (n is EmailNotification)` you have re-implemented what virtual "
                + "dispatch does for free - reread README ex4.");

        Teach.Equal("", Notifier.RenderAll(new List<Notification>()),
            "Nothing to render is an empty string, not a crash - string.Join handles it.");

        Teach.True(typeof(SmsNotification).IsSealed,
            "SmsNotification is meant to be the last word: mark the class sealed so nobody can "
                + "derive from it - reread README ex4.");

        Teach.True(!typeof(EmailNotification).IsSealed,
            "EmailNotification is NOT sealed - only the SMS one is. Sealing everything is as "
                + "thoughtless as sealing nothing.");
    }

    [Fact]
    public void Challenge_TheSkeletonIsFixedAndThePartsVary()
    {
        Report sales = new SalesReport(10m, 20m, 30m);

        Teach.Equal("== Sales ==\n3 sales totalling 60\n-- 3 rows --", sales.Render(),
            "Render builds header, body and footer in that order, joined by newlines. The "
                + "header is \"== \" + Title + \" ==\" - reread README challenge.");

        Report empty = new EmptyReport();

        Teach.Equal("== Empty ==\n(no data)\n-- end --", empty.Render(),
            "EmptyReport does not override Footer, so it inherits the virtual default. That "
                + "is the difference between abstract (you must) and virtual (you may) - "
                + "reread README challenge.");

        Teach.Equal("== Sales ==\n1 sale totalling 99\n-- 1 rows --", new SalesReport(99m).Render(),
            "One sale is a \"sale\". The footer's \"rows\" is deliberately not pluralised - "
                + "match the specification, not your instincts.");
    }

    [Fact]
    public void Review1_WheelsAreRequiredAndSoundIsOptional()
    {
        Vehicle car = new Car("hatchback");
        Vehicle bike = new Motorbike("scrambler");

        Teach.Equal("hatchback: 4 wheels, vroom", car.Describe(),
            "Car supplies Wheels and keeps the inherited Sound - reread README review.");

        Teach.Equal("scrambler: 2 wheels, brap", bike.Describe(),
            "Describe lives in the base class and never changed, yet it printed \"brap\": it "
                + "calls the virtual member, and the object chose the implementation.");

        Teach.Equal("vroom", car.Sound(),
            "Not overriding a virtual member is a legitimate choice - the base version stands.");
    }
}
