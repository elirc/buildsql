using CSharpDojo.D14_SetsQueuesStacks;

namespace CSharpDojo.Gates;

public class D14_SetsQueuesStacksTests
{
    [Fact]
    public void Ex1_ASetSpotsTheRepeat()
    {
        Teach.Equal("a2", Scanner.FirstDuplicate(new[] { "b7", "a2", "c9", "a2", "b7" }),
            "a2 is the first id to appear a SECOND time - b7's repeat comes later. "
                + "HashSet.Add returns false exactly when the item was already in the set - "
                + "reread README ex1.");

        Teach.True(Scanner.FirstDuplicate(new[] { "b7", "a2", "c9" }) is null,
            "No repeats means null, not an exception and not \"\".");
        Teach.True(Scanner.FirstDuplicate(Array.Empty<string>()) is null, "Nothing to repeat.");

        Teach.Equal(3, Scanner.CountUnique(new[] { "b7", "a2", "c9", "a2", "b7" }),
            "Five scans, three distinct ids - the set's Count IS the answer - reread README ex1.");
        Teach.Equal(0, Scanner.CountUnique(Array.Empty<string>()), "No ids, no distinct ids.");
    }

    [Fact]
    public void Ex2_IntersectExceptAndUnion()
    {
        string[] day1 = { "ada", "bo", "cy", "ada" };
        string[] day2 = { "bo", "dee", "cy" };

        Teach.Equal("bo, cy", string.Join(", ", Attendance.BothDays(day1, day2)),
            "bo and cy came both days - IntersectWith keeps exactly the shared items - "
                + "reread README ex2.");

        Teach.Equal("ada", string.Join(", ", Attendance.OnlyFirstDay(day1, day2)),
            "ada came only on day 1. ExceptWith removes day 2's people - and ada's duplicate "
                + "on day 1 counts once, because a set holds one of each - reread README ex2.");

        Teach.Equal(4, Attendance.TotalDistinct(day1, day2),
            "ada, bo, cy, dee - four people, however many sign-ins. UnionWith merges, Count "
                + "answers - reread README ex2.");

        Teach.Equal("ada, bo, cy", string.Join(", ", Attendance.OnlyFirstDay(day1, Array.Empty<string>())),
            "With nobody on day 2, day 1's distinct people all qualify, A-Z.");
        Teach.Equal(0, Attendance.BothDays(day1, Array.Empty<string>()).Count,
            "Nothing intersects with an empty day.");
    }

    [Fact]
    public void Ex3_TakePeekAndPostpone()
    {
        Queue<string> queue = new Queue<string>(new[] { "t1", "t2", "t3" });

        Teach.Equal("t1, t2", string.Join(", ", Tickets.UpNext(queue, 2)),
            "UpNext looks WITHOUT taking - enumerate (or Take) the queue, front first - "
                + "reread README ex3.");
        Teach.Equal(3, queue.Count, "...so all three tickets are still queued.");

        Teach.Equal("t1", Tickets.TakeNext(queue), "TakeNext serves the FRONT - first in, first out.");
        Teach.Equal(2, queue.Count, "...and removes it.");

        Teach.Equal("t2", Tickets.Postpone(queue),
            "Postpone moves the front ticket to the back and reports which one moved - "
                + "reread README ex3.");
        Teach.Equal("t3", Tickets.TakeNext(queue),
            "...so t3 is now served before the postponed t2.");
        Teach.Equal("t2", Tickets.TakeNext(queue), "t2 finally gets its turn.");

        Teach.True(Tickets.TakeNext(queue) is null,
            "An empty queue serves null, not an exception - Dequeue would throw, TryDequeue "
                + "does not - reread README ex3.");
        Teach.True(Tickets.Postpone(queue) is null, "...and there is nothing to postpone either.");
    }

    [Fact]
    public void Ex4_AnUndoStack()
    {
        Draft draft = new Draft();

        Teach.Equal("", draft.Text, "A new draft is empty.");
        Teach.True(!draft.CanUndo, "...with no history yet.");

        draft.Type("hello");
        draft.Type(" world");
        Teach.Equal("hello world", draft.Text, "Type appends - reread README ex4.");
        Teach.True(draft.CanUndo, "Two snapshots are stacked up.");

        Teach.True(draft.Undo(), "Undo pops the most recent snapshot...");
        Teach.Equal("hello", draft.Text,
            "...restoring the text as it was BEFORE the last Type. Push the OLD text before "
                + "appending, not the new one after - reread README ex4.");

        draft.Type("!");
        Teach.Equal("hello!", draft.Text, "Typing after an undo carries on from the restored text.");

        Teach.True(draft.Undo(), "Undo the '!'...");
        Teach.True(draft.Undo(), "...and the 'hello'...");
        Teach.Equal("", draft.Text, "...back to empty.");
        Teach.True(!draft.Undo(),
            "A fourth undo has nothing to pop: report false and change nothing. Pop on an "
                + "empty Stack would have thrown - reread README ex4.");
    }

    [Fact]
    public void Ex5_ASlidingWindowIsAQueue()
    {
        RateLimiter limiter = new RateLimiter(limit: 2, windowSeconds: 10);

        Teach.True(limiter.Allow(0), "The first request is free.");
        Teach.True(limiter.Allow(5), "The second fits too.");
        Teach.True(!limiter.Allow(9),
            "At second 9 both allowances (0 and 5) are still live, so the limit of 2 refuses "
                + "this one - and a REFUSED request is not remembered - reread README ex5.");
        Teach.Equal(2, limiter.InWindow, "Two granted requests in the window.");

        Teach.True(limiter.Allow(10),
            "At second 10 the allowance from second 0 has aged out (0 <= 10 - 10): evict from "
                + "the FRONT of the queue, then there is room - reread README ex5.");
        Teach.Equal(2, limiter.InWindow, "Now holding seconds 5 and 10.");

        Teach.True(!limiter.Allow(12), "5 and 10 are both still live at second 12.");
        Teach.True(limiter.Allow(15),
            "At 15 the allowance from 5 expires; oldest-first eviction is exactly what a "
                + "queue is for - reread README ex5.");
        Teach.Equal(2, limiter.InWindow, "Holding 10 and 15.");
    }

    [Fact]
    public void Ex6_SubsetOverlapAndSetEquality()
    {
        string[] roles = { "editor", "viewer" };

        Teach.True(Access.CanView(roles, new[] { "admin", "viewer" }),
            "Holding ANY listed role is enough - Overlaps answers that in one call - "
                + "reread README ex6.");
        Teach.True(!Access.CanView(roles, new[] { "admin" }), "No shared role, no view.");
        Teach.True(!Access.CanView(roles, Array.Empty<string>()),
            "Nothing can overlap with an EMPTY requirement - Overlaps with an empty sequence "
                + "is false, where the all-of check below is true. Know which is which - "
                + "reread README ex6.");

        Teach.True(Access.CanPublish(new[] { "admin", "editor", "viewer" }, new[] { "editor", "viewer" }),
            "Holding every required role - IsSupersetOf - reread README ex6.");
        Teach.True(!Access.CanPublish(roles, new[] { "editor", "admin" }), "Missing admin.");
        Teach.True(Access.CanPublish(roles, Array.Empty<string>()),
            "Requiring nothing is vacuously satisfied - every set is a superset of the empty set.");

        Teach.True(Access.SameCrew(new[] { "ada", "bo", "bo" }, new[] { "bo", "ada" }),
            "Order and duplicates are noise to SetEquals - reread README ex6.");
        Teach.True(!Access.SameCrew(new[] { "ada" }, new[] { "ada", "bo" }), "bo is extra.");
    }

    [Fact]
    public void Ex7_BrowserHistoryIsTwoStacks()
    {
        History history = new History("home");

        Teach.True(!history.Back(), "Nowhere to go back to yet.");

        history.Visit("a");
        history.Visit("b");
        Teach.Equal("b", history.Current, "Visits move you forward.");

        Teach.True(history.Back(), "Back once...");
        Teach.Equal("a", history.Current, "...to a - the leaving page went onto the FORWARD stack.");
        Teach.True(history.Back(), "Back again...");
        Teach.Equal("home", history.Current, "...to the start.");
        Teach.True(!history.Back(), "...and no further - report false, stay put.");

        Teach.True(history.Forward(), "Forward retraces the back-step...");
        Teach.Equal("a", history.Current, "...to a.");

        history.Visit("c");
        Teach.Equal("c", history.Current, "A fresh visit from a...");
        Teach.True(!history.Forward(),
            "...DESTROYS the forward stack: b is gone for good, exactly like a real browser. "
                + "If Forward still worked, Visit forgot to clear it - reread README ex7.");

        Teach.True(history.Back(), "But back still works...");
        Teach.Equal("a", history.Current, "...to where c was visited from.");
    }

    [Fact]
    public void Ex8_APostfixCalculator()
    {
        Teach.Equal(14, Postfix.Evaluate("3 4 + 2 *"),
            "(3 + 4) * 2. Numbers are pushed; an operator pops two, computes, pushes the "
                + "result - reread README ex8.");
        Teach.Equal(14, Postfix.Evaluate("2 3 4 + *"),
            "2 * (3 + 4): the stack IS the bracketing, no precedence rules needed.");

        Teach.Equal(6, Postfix.Evaluate("8 2 -"),
            "8 - 2, not 2 - 8. The FIRST pop is the RIGHT operand: it went on last - "
                + "reread README ex8.");
        Teach.Equal(4, Postfix.Evaluate("12 3 /"), "Same order rule for division.");
        Teach.Equal(7, Postfix.Evaluate("7"), "A lone number evaluates to itself.");

        Teach.Throws<FormatException>(() => Postfix.Evaluate("1 x +"),
            "x is neither a number nor an operator - reread README ex8.");
        Teach.Throws<InvalidOperationException>(() => Postfix.Evaluate("2 +"),
            "+ needs two operands and finds one: Pop on an empty Stack throws "
                + "InvalidOperationException all by itself - reread README ex8.");
        Teach.Throws<InvalidOperationException>(() => Postfix.Evaluate("1 2"),
            "Two values and no operator leaves two on the stack - a valid expression leaves "
                + "exactly one.");
        Teach.Throws<InvalidOperationException>(() => Postfix.Evaluate(""),
            "An empty expression leaves zero.");
    }
}
