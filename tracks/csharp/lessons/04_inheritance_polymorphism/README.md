# 04 — Inheritance and polymorphism

Lesson 03 gave you objects that own their state. This one gives you objects
that can *stand in for each other*. A method that takes a `Shape` will happily
be handed a `Circle`, call `Area()` on it, and get the circle's answer — without
the method containing the word "circle" anywhere. That substitution is
polymorphism, and it is the mechanism behind almost every extensible design in
.NET: the logging framework that accepts your custom logger, the test runner
that finds your test class, the middleware pipeline in ASP.NET Core.

Inheritance is one way to get there and it is the one with the worst
reputation, deservedly. Deep hierarchies — `Animal -> Mammal -> Dog -> Poodle` —
are the standard textbook example and a standard production mistake, because
every subclass inherits every decision the base made, forever. The rule most
teams settle on is "inherit for *is-a* plus shared implementation, compose for
everything else", and lesson 05 gives you the composition half.

So learn this properly, then be sparing with it. Two levels deep is usually
plenty.

## Concept — one word to the base, one word to the derived

```csharp
public abstract class Shape          // cannot be instantiated
{
    public abstract double Area();   // no body: subclasses must supply one
    public virtual string Unit() => "cm2";  // has a body: subclasses may replace it
}

public class Square : Shape
{
    public Square(double side) { Side = side; }
    public double Side { get; }
    public override double Area() => Side * Side;
}
```

Four keywords carry the whole feature:

- **`abstract`** on a class means "you cannot make one of these"; on a member it
  means "there is no sensible default, so every concrete subclass must supply
  one". The compiler enforces both.
- **`virtual`** means "here is a default, and a subclass may replace it".
- **`override`** is how the subclass replaces it, and it is required — C# will
  not let you silently override by accident, which is a deliberate difference
  from Java.
- **`sealed`** on a class means "no further derivation"; on a member, "this
  override is the last one".

**`base`** does two jobs. `: base(args)` in a constructor hands work to the base
class's constructor, which runs *first*, so the state the base owns is
initialised before your body runs. And `base.Method()` calls the implementation
you just overrode, which is how a subclass adds to behaviour rather than
replacing it:

```csharp
public override decimal Pay() => base.Pay() + Bonus;
```

**Virtual dispatch, in one sentence.** When you call a virtual member, the
runtime looks at what the object *is*, not at what the variable was declared
as. That is why this prints the circle's area:

```csharp
Shape s = new Circle(2);
s.Area();          // Circle.Area, every time
```

**And its evil twin, `new`.** You can declare a method that merely *hides* one
of the same name in the base class:

```csharp
public class Sneaky : Duck
{
    public new string Speak() => "shh";   // NOT an override
}
```

Now the answer depends on the type of the *variable*, not the object: a
`Duck`-typed variable gets `Duck.Speak`, a `Sneaky`-typed variable gets
`Sneaky.Speak`. One object, two answers. This is almost never what you want —
it exists so that a base class adding a method cannot break a derived class
that already had one — and it is asked about in interviews constantly, because
knowing the difference proves you understand what `virtual` actually does.

## Exercise 1 — an abstract base and two formulas

Edit `src/Lessons/L04_InheritancePolymorphism/Ex1.cs`. `Shape` is abstract and
declares `Area()` with no body. Implement `Rectangle.Area()` and
`Circle.Area()` — width × height, and pi r² using `Math.PI`.

Look at what is already written while you are there: both subclasses call
`: base("rectangle")` / `: base("circle")`, so the `Name` property lives in one
place and each subclass supplies its own word.

```
uv run dojo test csharp 04_inheritance_polymorphism ex1
```

## Exercise 2 — adding to inherited behaviour

Edit `src/Lessons/L04_InheritancePolymorphism/Ex2.cs`. `Employee.MonthlyPay()`
is one twelfth of the annual salary, rounded to the cent, halves away from
zero. `Manager.MonthlyPay()` is that, plus the manager's flat monthly bonus —
and it must **call** the base version rather than repeating the division.

The gate then assigns the manager to an `Employee`-typed variable and calls
`MonthlyPay()` again. Predict what you will get before you run it.

```
uv run dojo test csharp 04_inheritance_polymorphism ex2
```

## Exercise 3 — `override` versus `new`

Edit `src/Lessons/L04_InheritancePolymorphism/Ex3.cs`. `Duck.Speak()` is
`virtual` and says `"quack"`. Two subclasses are waiting, each missing a
modifier:

`LoudDuck` must **override**, returning `"QUACK"`, so every caller hears it.

`SneakyDuck` must **hide** with `new`, returning `"shh"`, so only a caller
holding a `SneakyDuck`-typed reference hears it — a `Duck`-typed variable still
gets `"quack"`.

Add the right keyword to each and fill in the bodies. The compiler is already
warning you about both methods; read those warnings, one of them names the
keyword it thinks you meant.

```
uv run dojo test csharp 04_inheritance_polymorphism ex3
```

## Exercise 4 — one loop, every kind

Edit `src/Lessons/L04_InheritancePolymorphism/Ex4.cs`. Implement
`EmailNotification.Render()` -> `"email to ada@example.com: Welcome"` and
`SmsNotification.Render()` -> `"sms to 07700900123: Your code is 1234"`, then
`Notifier.RenderAll(...)`, which renders every notification in order and joins
them with `" | "`. An empty sequence renders as `""`.

`RenderAll` must contain no type checks at all — no `is`, no `switch` on type,
no casting. If you find yourself asking "what kind is this?", the abstract
method already answered.

One more thing: `SmsNotification` is meant to be the end of its line. Add the
modifier that makes deriving from it a compile error.

```
uv run dojo test csharp 04_inheritance_polymorphism ex4
```

## Challenge — the template method

Edit `src/Lessons/L04_InheritancePolymorphism/Challenge.cs`. `Report.Render()`
defines the fixed skeleton — a header line, a body, a footer, joined by `"\n"`:

```
== Sales ==
3 sales totalling 60
-- 3 rows --
```

`Render` itself is not virtual: subclasses fill in the parts and never
rearrange the whole. Implement `Render`, then `SalesReport.Body()` (count and
total, with "sale"/"sales" pluralised) and `SalesReport.Footer()`, then
`EmptyReport.Body()` -> `"(no data)"`.

Honest difficulty note: the code is short; the design is the difficulty.
Notice that `EmptyReport` deliberately does not override `Footer()` and gets
`"-- end --"` from the base — the difference between `abstract` (you must) and
`virtual` (you may) in one working example. This shape has a name, the
*template method pattern*, and you have already used it: this is how every
ASP.NET Core `ControllerBase` and every xUnit fixture works.

```
uv run dojo test csharp 04_inheritance_polymorphism challenge
```

## Review

`review1` is `Vehicle` / `Car` / `Motorbike`: one abstract property everyone
must answer, one virtual method most can ignore, and a `Describe()` written in
the base class that calls both. `dojo review` will bring it back.

## The gate

This is the entire gate class, `tests/Gates/L04_InheritancePolymorphismTests.cs`:

```csharp
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
```

In plain English: `Ex1` holds both shapes in `Shape`-typed variables and checks
each formula. `Ex2` checks the base calculation, the derived one, and then the
same manager through an `Employee` variable. `Ex3` calls `Speak` through both
the base type and the derived type for each duck — four calls, and the two
duck kinds differ in exactly one of them. `Ex4` renders a mixed list, checks
the empty case, and reflects over both classes to check which one is sealed.
`Challenge` renders two reports, and `Review1` is the spaced-repetition variant.

## The teaching point

The `new`-versus-`override` distinction in ex3 looks like trivia and is not.
It exists because inheritance creates a contract between two pieces of code
that may be versioned separately: if a base class in someone else's library
adds a `Save()` method, and your derived class already had one, your code must
keep compiling and keep meaning what it meant. `new` is the escape hatch for
exactly that, and the compiler's warning when you omit it is asking "which of
these two things did you mean?"

The deeper habit is the one ex4 drills: **let the object decide**. Every `if`
that asks "what kind of thing is this?" is a place where adding a new kind
means editing existing code — and missing one of the places. Replace it with a
virtual call and the new kind arrives complete, with nothing to update. When
you see `switch` on a type name in a code review, that is the question to ask,
and the answer is usually a base method or an interface.

Next: **05_interfaces**, which is the same substitutability without the
inheritance — and the tool you will actually reach for most days.
