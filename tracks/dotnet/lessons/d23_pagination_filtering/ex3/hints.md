## Hint 1

Two ideas, and they are independent. `?sort=` is a vocabulary - the same
membership check you wrote for `?status=` in d15, against `D23Board.Sorts`.
And a *paged* sort needs a total order: if two rows compare equal on the sort
column, the database is free to order them differently on page 1 and page 2.

## Hint 2

Check membership against `D23Board.Sorts` before the value goes anywhere near
the query, then map the key to an ordering with a `switch` expression over an
`IQueryable<Posting>` you keep reassigning:

    IQueryable<Posting> q = db.Postings;
    q = key switch
    {
        "postedDay" => q.OrderBy(x => x.PostedDay).ThenBy(x => x.Id),
        ...
    };

`OrderBy` returns an `IOrderedQueryable`, which is still an `IQueryable`, so
that assignment compiles. Every arm ends in `.ThenBy(x => x.Id)` - including
the descending ones, where the README says the tiebreak stays ascending.
