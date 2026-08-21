using CSharpDojo.L13_AsyncAwait;

namespace CSharpDojo.Gates;

public class L13_AsyncAwaitTests
{
    [Fact]
    public async Task Ex1_AwaitBothBeforeYouAnswer()
    {
        TaskCompletionSource<int> first = new TaskCompletionSource<int>();
        TaskCompletionSource<int> second = new TaskCompletionSource<int>();

        Task<int> sum = Awaiting.SumAsync(first.Task, second.Task);

        Teach.True(!sum.IsCompleted,
            "Neither input has produced a value yet, so the result cannot be finished. If this "
                + "failed, you returned something without awaiting - reread README ex1.");

        second.SetResult(3);
        Teach.True(!sum.IsCompleted,
            "One of the two is in. Still not enough - reread README ex1.");

        first.SetResult(2);
        Teach.Equal(5, await sum, "2 + 3, whichever order they arrived in.");

        TaskCompletionSource<string> left = new TaskCompletionSource<string>();
        TaskCompletionSource<string> right = new TaskCompletionSource<string>();
        Task<string> joined = Awaiting.InOrderAsync(left.Task, right.Task);

        right.SetResult("two");
        left.SetResult("one");

        Teach.Equal("one+two", await joined,
            "The SECOND task finished first, and the answer still reads \"one+two\": the "
                + "output order comes from the parameters, not from who won - reread README ex1.");
    }

    [Fact]
    public async Task Ex2_WhenAllKeepsTheInputOrder()
    {
        TaskCompletionSource<int> a = new TaskCompletionSource<int>();
        TaskCompletionSource<int> b = new TaskCompletionSource<int>();
        TaskCompletionSource<int> c = new TaskCompletionSource<int>();

        Task<int> total = Fanout.SumAllAsync(new[] { a.Task, b.Task, c.Task });

        c.SetResult(3);
        a.SetResult(1);
        Teach.True(!total.IsCompleted, "Two of three: WhenAll waits for every one of them - "
            + "reread README ex2.");

        b.SetResult(2);
        Teach.Equal(6, await total, "1 + 2 + 3.");

        TaskCompletionSource<string> x = new TaskCompletionSource<string>();
        TaskCompletionSource<string> y = new TaskCompletionSource<string>();
        TaskCompletionSource<string> z = new TaskCompletionSource<string>();

        Task<string> joined = Fanout.JoinAsync(new[] { x.Task, y.Task, z.Task });

        z.SetResult("zebra");
        y.SetResult("yak");
        x.SetResult("xerus");

        Teach.Equal("xerus, yak, zebra", await joined,
            "They finished in exactly the reverse order, and the answer is still in input "
                + "order: Task.WhenAll's result array lines up with the tasks you gave it - "
                + "reread README ex2.");

        Teach.Equal(0, await Fanout.SumAllAsync(Array.Empty<Task<int>>()),
            "WhenAll over nothing completes immediately, and the sum of nothing is 0.");
    }

    [Fact]
    public async Task Ex3_CancellationStopsTheWaitingNotTheWork()
    {
        Teach.Equal(7, await Cancellable.WaitOrCancelAsync(Task.FromResult(7), CancellationToken.None),
            "With nothing cancelled, this is just an await - reread README ex3.");

        TaskCompletionSource<int> never = new TaskCompletionSource<int>();
        CancellationTokenSource source = new CancellationTokenSource();
        Task<int> pending = Cancellable.WaitOrCancelAsync(never.Task, source.Token);

        Teach.True(!pending.IsCompleted, "Nothing has happened yet - the work is still running "
            + "and nobody has cancelled.");

        source.Cancel();

        await Teach.ThrowsAsync<OperationCanceledException>(
            () => pending,
            "Once the token is cancelled, the wait must end with an OperationCanceledException "
                + "- Task.WaitAsync(token) does exactly this - reread README ex3. Note the "
                + "work itself is still running: cancelling a wait cannot un-start a task.");

        Teach.True(!never.Task.IsCompleted,
            "...and there is the proof: the underlying task is still pending.");

        Teach.Equal(6, await Cancellable.SumUntilCancelledAsync(
                new[] { Task.FromResult(1), Task.FromResult(2), Task.FromResult(3) },
                CancellationToken.None),
            "No cancellation, so every task contributes - reread README ex3.");

        CancellationTokenSource cancelled = new CancellationTokenSource();
        cancelled.Cancel();

        await Teach.ThrowsAsync<OperationCanceledException>(
            () => Cancellable.SumUntilCancelledAsync(new[] { Task.FromResult(1) }, cancelled.Token),
            "An ALREADY cancelled token means do no work at all: check it at the top of the "
                + "loop with token.ThrowIfCancellationRequested() - reread README ex3.");
    }

    [Fact]
    public async Task Ex4_AwaitUnwrapsWhatResultWrapsUp()
    {
        Teach.Equal(41, await Faults.RunAsync(Task.FromResult(41)), "The ordinary path.");

        TaskCompletionSource<int> broken = new TaskCompletionSource<int>();
        broken.SetException(new InvalidOperationException("inner boom"));

        InvalidOperationException caught = await Teach.ThrowsAsync<InvalidOperationException>(
            () => Faults.RunAsync(broken.Task),
            "await rethrows the ORIGINAL exception. Blocking on .Result or .Wait() instead "
                + "throws an AggregateException with the real one buried inside - which is why "
                + "this gate can tell the two apart - reread README ex4.");

        Teach.Equal("inner boom", caught.Message, "...and it is the same exception object, "
            + "message and all.");

        Task<int> failing = Faults.AlwaysFailsAsync();

        Teach.True(failing.IsFaulted || !failing.IsCompleted,
            "Calling AlwaysFailsAsync must RETURN a task carrying the failure, not throw in "
                + "the caller's face. If the exception escaped at the call site this line "
                + "never even ran - which means the method is not `async` - reread README ex4.");

        InvalidOperationException later = await Teach.ThrowsAsync<InvalidOperationException>(
            () => failing,
            "The failure surfaces when the task is awaited.");

        Teach.Equal("boom", later.Message, "With the message the prompt asked for.");
    }

    [Fact]
    public async Task Challenge_SummariseReportsSuccessFailureAndCancellation()
    {
        TaskCompletionSource<int> a = new TaskCompletionSource<int>();
        TaskCompletionSource<int> b = new TaskCompletionSource<int>();
        Task<string> ok = Pipeline.SummariseAsync(
            new[] { a.Task, b.Task }, CancellationToken.None);

        a.SetResult(4);
        b.SetResult(5);
        Teach.Equal("ok: 9", await ok, "Everything succeeded, so report the total - reread "
            + "README challenge.");

        TaskCompletionSource<int> good = new TaskCompletionSource<int>();
        TaskCompletionSource<int> bad = new TaskCompletionSource<int>();
        Task<string> failed = Pipeline.SummariseAsync(
            new[] { good.Task, bad.Task }, CancellationToken.None);

        good.SetResult(1);
        bad.SetException(new TimeoutException("too slow"));

        Teach.Equal("failed: TimeoutException", await failed,
            "One task faulted, so report its exception type. Task.WhenAll waits for ALL of "
                + "them even after one fails, and its awaited exception is the first one - "
                + "reread README challenge.");

        TaskCompletionSource<int> pendingWork = new TaskCompletionSource<int>();
        CancellationTokenSource source = new CancellationTokenSource();
        Task<string> cancelled = Pipeline.SummariseAsync(new[] { pendingWork.Task }, source.Token);

        Teach.True(!cancelled.IsCompleted, "Nothing has finished and nothing is cancelled yet.");

        source.Cancel();

        await Teach.ThrowsAsync<OperationCanceledException>(
            () => cancelled,
            "Cancellation is not a failure to report - it travels out as an "
                + "OperationCanceledException. A bare `catch` that swallows it and returns "
                + "\"failed: ...\" is the bug this check exists to catch - reread README "
                + "challenge.");
    }
}
