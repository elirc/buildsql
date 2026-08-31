## Hint 1

Nothing here is new: it is ex4's filters, ex3's whitelist and ex6's cursor on
one `IQueryable`. Because all three are deferred operators, stacking them costs
one `SELECT`, and that is what the budget is checking.

The one genuinely new idea is that a cursor has a *direction*.

## Hint 2

Decide `descending` from the sort key once, then use it twice - for the cursor
comparison and for the ordering - so the two can never disagree:

    q = descending
        ? q.Where(x => x.PostedDay < day || (x.PostedDay == day && x.Id < id))
        : q.Where(x => x.PostedDay > day || (x.PostedDay == day && x.Id > id));

Apply the filters before the cursor clause, order last, then `Take(size + 1)`.
The filters have to be applied on *every* call - the cursor is a position in
the ordering, not a handle on a stored result set.

## Hint 3

The two 400s are about refusing to guess. A cursor `D23Cursor.TryDecode` cannot
read is keyed `"after"`; treating it as "no cursor" restarts the feed and the
client loops over page 1 forever with no error to report.

A `?sort=` outside `D23Board.FeedSorts` is keyed `"sort"`. `title` is a legal
key in ex3 and not here, because a cursor over `(PostedDay, Id)` cannot resume
an ordering by title - check `FeedSorts`, not `Sorts`.
