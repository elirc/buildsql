# d17 - Events drills

Eight problems on the publisher's side of an event: declaring one, raising it
without a `NullReferenceException`, carrying data in `EventArgs`, controlling
the subscriber list, and the two things a multicast delegate does badly - one
handler that throws, and handlers that return values. They drill lesson 09 -
reread `09_delegates_events_lambdas` if `+=` on an event is still mysterious.

Every file lives in `src/Lessons/D17_Events/`. Nothing here depends on anything
else here.

## Exercise 1 - raising an event nobody may be listening to

`Kettle.Heat(degrees)` adds to `Celsius` and raises the `Boiled` event on the
crossing from below 100 to 100 or above - once, not on every later call, and
not at all when nobody is subscribed. The sender is the kettle; the args are
`EventArgs.Empty`.

Edit `src/Lessons/D17_Events/Ex1.cs`.

```
uv run dojo test csharp d17_events ex1
```

## Exercise 2 - an event that carries data

`StockLowEventArgs` derives from `EventArgs` and carries `Sku` and
`Remaining`. `Warehouse` has `Receive`, `Remaining(sku)` (zero for an unknown
SKU) and `Ship`, which throws `InvalidOperationException` and changes nothing
when there is not enough stock, and otherwise raises `StockLow` whenever the
count left is strictly below `Threshold`.

Edit `src/Lessons/D17_Events/Ex2.cs`.

```
uv run dojo test csharp d17_events ex2
```

## Exercise 3 - many subscribers on one event

`Bell.Ring(note)` raises `Rung` for every subscriber, in subscription order and
without throwing when there are none. `Bell.Silence()` drops the whole
subscriber list at once - which is legal only inside the declaring class. The
gate also checks what `+=` and `-=` do with a duplicate handler.

Edit `src/Lessons/D17_Events/Ex3.cs`.

```
uv run dojo test csharp d17_events ex3
```

## Exercise 4 - a subscription you can hand back

`Feed.Subscribe(handler)` registers the handler and returns an `Action` that
removes it again. Calling that action twice must not remove anybody else's
handler. `Feed.Publish(item)` calls every current handler in subscription
order.

Edit `src/Lessons/D17_Events/Ex4.cs`.

```
uv run dojo test csharp d17_events ex4
```

## Exercise 5 - writing the add and remove accessors yourself

`Room.Entered` is declared with explicit `add` and `remove` accessors over the
private `_entered` field. `Subscribers` is the live count and
`PeakSubscribers` is the highest it has ever been. Removing a handler that was
never added must move neither number. `Enter()` raises the event with the room
as the sender.

Edit `src/Lessons/D17_Events/Ex5.cs`.

```
uv run dojo test csharp d17_events ex5
```

## Exercise 6 - one bad handler must not silence the rest

`Broadcaster.BroadcastNaive` is written for you and shows the problem: the
first handler that throws ends the raise, so later handlers never run.
`Broadcaster.Broadcast(text)` must call every handler anyway and return the
exceptions it caught, in the order they happened - an empty list when all was
well.

Edit `src/Lessons/D17_Events/Ex6.cs`.

```
uv run dojo test csharp d17_events ex6
```

## Exercise 7 - every handler's answer, not just the last one

`Poll.NaiveTotal` is written for you and shows the problem: invoking a
multicast `Func<int>` runs every handler and returns only the last one's
result. `Poll.AllVotes()` returns every handler's answer in subscription order,
and `Poll.Total()` sums them. No subscribers means an empty list and zero.

Edit `src/Lessons/D17_Events/Ex7.cs`.

```
uv run dojo test csharp d17_events ex7
```

## Exercise 8 - a typed event bus

`EventBus` keeps one handler list per message type in the supplied dictionary.
`Subscribe<T>`, `Unsubscribe<T>` (true when it removed one), `SubscriberCount<T>`
and `Publish<T>`, which delivers in registration order and returns how many
handlers ran. Publishing a type nobody subscribed to delivers to nobody. A
handler that subscribes during delivery must not receive the message being
delivered.

Edit `src/Lessons/D17_Events/Ex8.cs`.

```
uv run dojo test csharp d17_events ex8
```

## The gate

This is the entire gate class, `tests/Gates/D17_EventsTests.cs`:

```csharp
using CSharpDojo.D17_Events;

namespace CSharpDojo.Gates;

public class D17_EventsTests
{
    [Fact]
    public void Ex1_RaisingAnEventNobodyMayBeListeningTo()
    {
        Kettle quiet = new Kettle();
        quiet.Heat(200);
        Teach.Equal(200, quiet.Celsius,
            "With no subscribers the raise must simply do nothing. If this threw a "
                + "NullReferenceException you invoked the event without the null-conditional "
                + "`?.` - reread README ex1.");

        Kettle kettle = new Kettle();
        int raised = 0;
        object? sender = null;
        EventArgs? args = null;
        kettle.Boiled += (s, e) =>
        {
            raised++;
            sender = s;
            args = e;
        };

        Teach.True(kettle.HasListeners, "The handler is on the list.");

        kettle.Heat(50);
        Teach.Equal(50, kettle.Celsius, "Heating adds to the temperature.");
        Teach.Equal(0, raised, "50 degrees is not boiling, so nothing was raised.");

        kettle.Heat(60);
        Teach.Equal(110, kettle.Celsius, "50 plus 60 is 110.");
        Teach.Equal(1, raised,
            "Crossing 100 raises Boiled exactly once - reread README ex1.");
        Teach.True(ReferenceEquals(kettle, sender),
            "The sender argument is the object that raised the event, which is `this` - passing "
                + "null or the args means a handler shared between two kettles cannot tell them "
                + "apart - reread README ex1.");
        Teach.True(ReferenceEquals(EventArgs.Empty, args),
            "An event with nothing to say passes EventArgs.Empty rather than a fresh EventArgs - "
                + "reread README ex1.");

        kettle.Heat(10);
        Teach.Equal(120, kettle.Celsius, "It keeps getting hotter...");
        Teach.Equal(1, raised,
            "...but boiling again is not an event: the raise happens on the CROSSING, so you "
                + "have to look at the temperature before as well as after - reread README ex1.");
    }

    [Fact]
    public void Ex2_AnEventThatCarriesData()
    {
        Warehouse warehouse = new Warehouse(5);
        List<string> reports = new List<string>();
        warehouse.StockLow += (sender, e) => reports.Add($"{e.Sku}={e.Remaining}");

        warehouse.Receive("bolt", 10);
        Teach.Equal(10, warehouse.Remaining("bolt"), "Receiving adds to the count.");
        Teach.Equal(0, warehouse.Remaining("nut"),
            "A SKU nobody ever received reads as zero rather than throwing - reread README ex2.");
        Teach.Equal(0, reports.Count, "Receiving never raises the event.");

        warehouse.Ship("bolt", 4);
        Teach.Equal(6, warehouse.Remaining("bolt"), "Ten minus four.");
        Teach.Equal(0, reports.Count,
            "Six is still at or above the threshold of five, so there is nothing to report - "
                + "the test is STRICTLY below - reread README ex2.");

        warehouse.Ship("bolt", 2);
        Teach.Equal(4, warehouse.Remaining("bolt"), "Six minus two.");
        Teach.Equal("bolt=4", string.Join(" | ", reports),
            "Four is below five, so StockLow carries the SKU and the count that is left - not "
                + "the count that was shipped - reread README ex2.");

        warehouse.Ship("bolt", 1);
        Teach.Equal("bolt=4 | bolt=3", string.Join(" | ", reports),
            "Every shipment that leaves the count low reports again - reread README ex2.");

        Teach.Throws<InvalidOperationException>(() => warehouse.Ship("bolt", 99),
            "Shipping more than there is is an error, not a negative balance - reread README ex2.");
        Teach.Equal(3, warehouse.Remaining("bolt"),
            "...and the refused shipment changed nothing: check before you subtract.");
        Teach.Equal(2, reports.Count, "...and raised nothing.");

        StockLowEventArgs args = new StockLowEventArgs("nut", 2);
        Teach.Equal("nut", args.Sku, "The args type carries the data the handler needs.");
        Teach.Equal(2, args.Remaining, "...both fields of it.");
        Teach.True(args.GetType().IsSubclassOf(typeof(EventArgs)),
            "A custom args type derives from EventArgs, which is what lets it be used with "
                + "EventHandler<T> - reread README ex2.");
    }

    [Fact]
    public void Ex3_ManySubscribersOnOneEvent()
    {
        Bell bell = new Bell();
        List<string> log = new List<string>();

        Action<string> first = note => log.Add($"first:{note}");
        Action<string> second = note => log.Add($"second:{note}");

        bell.Ring("ignored");
        Teach.Equal(0, log.Count,
            "Ringing with nobody listening does nothing at all - reread README ex3.");

        bell.Rung += first;
        bell.Rung += second;
        Teach.Equal(2, bell.SubscriberCount, "Two handlers on the list.");

        bell.Ring("a");
        Teach.Equal("first:a | second:a", string.Join(" | ", log),
            "A multicast delegate calls its handlers in the order they were added - reread "
                + "README ex3.");

        log.Clear();
        bell.Rung += first;
        Teach.Equal(3, bell.SubscriberCount,
            "The same handler added twice really is on the list twice - `+=` does not "
                + "de-duplicate - reread README ex3.");
        bell.Ring("b");
        Teach.Equal("first:b | second:b | first:b", string.Join(" | ", log),
            "...so it runs twice, in position - reread README ex3.");

        log.Clear();
        bell.Rung -= first;
        Teach.Equal(2, bell.SubscriberCount,
            "`-=` removes ONE copy, the last one added - reread README ex3.");
        bell.Ring("c");
        Teach.Equal("first:c | second:c", string.Join(" | ", log), "...leaving the other copy.");

        log.Clear();
        bell.Silence();
        Teach.Equal(0, bell.SubscriberCount,
            "Silence drops the whole list at once. Assigning null to an event is only legal "
                + "inside the class that declares it, which is exactly why this method has to "
                + "exist - reread README ex3.");
        bell.Ring("d");
        Teach.Equal(0, log.Count, "...and nothing is left to hear it.");
    }

    [Fact]
    public void Ex4_ASubscriptionYouCanHandBack()
    {
        Feed feed = new Feed();
        List<string> seen = new List<string>();

        Action stopFirst = feed.Subscribe(item => seen.Add($"1:{item}"));
        feed.Subscribe(item => seen.Add($"2:{item}"));
        Teach.Equal(2, feed.SubscriberCount, "Two handlers registered.");

        feed.Publish("alpha");
        Teach.Equal("1:alpha | 2:alpha", string.Join(" | ", seen),
            "Both handlers ran, in subscription order - reread README ex4.");

        seen.Clear();
        stopFirst();
        Teach.Equal(1, feed.SubscriberCount,
            "The returned action removed the handler it was made for. It works because the "
                + "closure captured the delegate itself - a lambda you did not keep a reference "
                + "to cannot be removed later - reread README ex4.");

        feed.Publish("beta");
        Teach.Equal("2:beta", string.Join(" | ", seen), "...so only the second handler heard it.");

        stopFirst();
        Teach.Equal(1, feed.SubscriberCount,
            "Calling the unsubscriber a second time does nothing. Without the guard it would "
                + "still be harmless here, but the flag is what makes that a promise rather than "
                + "an accident - reread README ex4.");

        Feed empty = new Feed();
        empty.Publish("nobody");
        Teach.Equal(0, empty.SubscriberCount, "Publishing to nobody is not an error.");

        Action<string> shared = item => seen.Add($"s:{item}");
        Action stopA = empty.Subscribe(shared);
        empty.Subscribe(shared);
        Teach.Equal(2, empty.SubscriberCount, "The same handler subscribed twice counts twice.");
        stopA();
        Teach.Equal(1, empty.SubscriberCount,
            "...and one unsubscribe removes one copy - reread README ex4.");
    }

    [Fact]
    public void Ex5_WritingTheAddAndRemoveAccessorsYourself()
    {
        Room room = new Room();
        Teach.Equal(0, room.Subscribers, "Nobody is listening yet.");
        Teach.Equal(0, room.PeakSubscribers, "...and nobody ever was.");
        Teach.True(!room.HasListeners, "...which the supplied property agrees with.");

        int aCalls = 0;
        int bCalls = 0;
        EventHandler a = (sender, e) => aCalls++;
        EventHandler b = (sender, e) => bCalls++;

        room.Entered += a;
        Teach.Equal(1, room.Subscribers, "The add accessor counted the subscription - reread README ex5.");
        room.Entered += b;
        Teach.Equal(2, room.Subscribers, "...and the second one.");
        Teach.Equal(2, room.PeakSubscribers, "The peak has reached two.");

        room.Enter();
        Teach.Equal(1, aCalls, "Both handlers ran...");
        Teach.Equal(1, bCalls, "...once each.");

        room.Entered -= a;
        Teach.Equal(1, room.Subscribers, "The remove accessor counted the departure.");
        Teach.Equal(2, room.PeakSubscribers,
            "...but the peak only ever goes up: it is a high-water mark - reread README ex5.");

        room.Enter();
        Teach.Equal(1, aCalls, "The removed handler no longer runs...");
        Teach.Equal(2, bCalls, "...and the remaining one still does.");

        EventHandler stranger = (sender, e) => { };
        room.Entered -= stranger;
        Teach.Equal(1, room.Subscribers,
            "Removing a handler that was never added is a silent no-op on the delegate, so the "
                + "count must not move either. Blindly writing Subscribers-- in the remove "
                + "accessor is what this checks for - reread README ex5.");

        room.Entered -= b;
        Teach.Equal(0, room.Subscribers, "The room is empty again...");
        Teach.True(!room.HasListeners, "...and the backing delegate really is null.");
        Teach.Equal(2, room.PeakSubscribers, "...and the peak still remembers.");
        room.Enter();
        Teach.Equal(2, bCalls, "Entering an empty room raises nothing.");
    }

    [Fact]
    public void Ex6_OneBadHandlerMustNotSilenceTheRest()
    {
        Broadcaster broadcaster = new Broadcaster();
        List<string> heard = new List<string>();

        broadcaster.Message += text => heard.Add($"a:{text}");
        broadcaster.Message += text => throw new InvalidOperationException("boom");
        broadcaster.Message += text => heard.Add($"c:{text}");

        Teach.Throws<InvalidOperationException>(() => broadcaster.BroadcastNaive("x"),
            "The supplied naive raise lets the handler's exception escape to the publisher - "
                + "reread README ex6.");
        Teach.Equal("a:x", string.Join(" | ", heard),
            "...and the third handler never ran, because a multicast invoke stops at the first "
                + "throw. That is the bug you are fixing - reread README ex6.");

        heard.Clear();
        List<Exception> failures = broadcaster.Broadcast("y");
        Teach.Equal("a:y | c:y", string.Join(" | ", heard),
            "Broadcast walks GetInvocationList and calls the handlers one at a time inside a "
                + "try, so the handler after the bad one still runs - reread README ex6.");
        Teach.Equal(1, failures.Count, "One handler threw...");
        Teach.Equal("boom", failures[0].Message, "...and its exception was collected, not lost.");
        Teach.True(failures[0] is InvalidOperationException,
            "The original exception object is kept - catching and rethrowing a new one would "
                + "throw away the stack trace - reread README ex6.");

        Broadcaster quiet = new Broadcaster();
        Teach.Equal(0, quiet.Broadcast("z").Count,
            "With no subscribers there is nothing to invoke and nothing to report - "
                + "GetInvocationList on a null delegate would throw, so the null check comes "
                + "first - reread README ex6.");

        Broadcaster happy = new Broadcaster();
        int calls = 0;
        happy.Message += text => calls++;
        Teach.Equal(0, happy.Broadcast("ok").Count, "Nothing threw, so the list is empty...");
        Teach.Equal(1, calls, "...and the handler still ran.");
    }

    [Fact]
    public void Ex7_EveryHandlersAnswerNotJustTheLastOne()
    {
        Poll poll = new Poll();
        Teach.Equal(0, poll.NaiveTotal(), "No subscribers, no votes.");
        Teach.Equal(0, poll.Total(), "...by either route.");
        Teach.Equal(0, poll.AllVotes().Count, "...and the list is empty rather than null.");

        poll.Votes += () => 1;
        poll.Votes += () => 2;
        poll.Votes += () => 3;

        Teach.Equal(3, poll.NaiveTotal(),
            "The supplied naive version shows the trap: invoking a multicast Func runs all three "
                + "handlers and hands back only the LAST one's answer - reread README ex7.");

        Teach.Equal("1|2|3", string.Join("|", poll.AllVotes()),
            "AllVotes walks GetInvocationList, casts each entry back to Func<int> and calls it, "
                + "so every answer survives - in subscription order - reread README ex7.");

        Teach.Equal(6, poll.Total(),
            "...and the total is the sum of all three, not the last one - reread README ex7.");

        int evaluations = 0;
        Poll counting = new Poll();
        counting.Votes += () => { evaluations++; return 10; };
        counting.Votes += () => { evaluations++; return 20; };
        counting.AllVotes();
        Teach.Equal(2, evaluations, "Each handler is called exactly once per AllVotes.");

        Func<int> five = () => 5;
        Poll twice = new Poll();
        twice.Votes += five;
        twice.Votes += five;
        Teach.Equal(10, twice.Total(),
            "The same handler subscribed twice votes twice - the invocation list is a list, not "
                + "a set - reread README ex7.");
    }

    [Fact]
    public void Ex8_ATypedEventBus()
    {
        EventBus bus = new EventBus();
        List<string> log = new List<string>();

        Action<string> firstText = text => log.Add($"text1:{text}");
        bus.Subscribe(firstText);
        bus.Subscribe<string>(text => log.Add($"text2:{text}"));
        bus.Subscribe<int>(number => log.Add($"int:{number}"));

        Teach.Equal(2, bus.SubscriberCount<string>(), "Two handlers want strings...");
        Teach.Equal(1, bus.SubscriberCount<int>(), "...and one wants ints.");
        Teach.Equal(0, bus.SubscriberCount<decimal>(),
            "A type nobody subscribed to has no handlers rather than throwing - reread README ex8.");

        Teach.Equal(2, bus.Publish("hello"),
            "Publishing a string reaches both string handlers and returns how many ran - "
                + "reread README ex8.");
        Teach.Equal("text1:hello | text2:hello", string.Join(" | ", log),
            "...in registration order, and the int handler was not disturbed: the dictionary is "
                + "keyed by typeof(T) - reread README ex8.");

        log.Clear();
        Teach.Equal(1, bus.Publish(7), "The int handler alone.");
        Teach.Equal("int:7", string.Join(" | ", log), "...and it got the value.");

        log.Clear();
        Teach.Equal(0, bus.Publish(1.5m),
            "Publishing a type nobody subscribed to delivers to nobody and is not an error - "
                + "reread README ex8.");
        Teach.Equal(0, log.Count, "...so nothing was logged.");

        Teach.True(bus.Unsubscribe(firstText),
            "Unsubscribe reports that it found and removed the handler - reread README ex8.");
        Teach.Equal(1, bus.SubscriberCount<string>(), "...leaving one string handler.");
        Teach.True(!bus.Unsubscribe(firstText),
            "Removing it a second time finds nothing and says so - reread README ex8.");
        Teach.True(!bus.Unsubscribe<decimal>(value => { }),
            "...and so does removing from a type that was never subscribed to.");

        EventBus reentrant = new EventBus();
        int deliveries = 0;
        reentrant.Subscribe<string>(text =>
        {
            deliveries++;
            reentrant.Subscribe<string>(inner => deliveries++);
        });
        int ran = reentrant.Publish("go");
        Teach.Equal(1, ran,
            "The handler subscribed another handler while the message was being delivered. "
                + "Publish must iterate a SNAPSHOT of the list, or this either delivers to the "
                + "new handler too or throws InvalidOperationException for modifying a "
                + "collection while enumerating it - reread README ex8.");
        Teach.Equal(1, deliveries, "...so only the original handler saw this message.");
        Teach.Equal(2, reentrant.SubscriberCount<string>(),
            "...and the new handler is registered for the NEXT one.");
        Teach.Equal(2, reentrant.Publish("again"), "...which it duly receives.");
    }
}
```
