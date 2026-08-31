## Hint 1

An `IQueryable` is a description of a query, not a result. Nothing runs until
you enumerate it, so you can keep adding `Where` clauses in ordinary `if`
statements and still pay for exactly one `SELECT` at the end. That is what the
one-command budget is checking.

The tag filter is a different problem: `Tags` is a comma separated list, and a
tag is one whole element of it, not any run of letters inside it.

## Hint 2

Declare the query once and reassign it:

    IQueryable<Posting> q = db.Postings;
    if (remote is bool wantRemote) q = q.Where(x => x.Remote == wantRemote);

Pattern-matching the nullable into a plain local keeps the expression tree free
of `Nullable<T>.Value`.

For the tag, put the delimiter on both sides so the match has to land on
element boundaries: search `"," + x.Tags + ","` for `"," + tag + ","`. Compute
the needle into a local first. It still translates - it becomes `instr()` over
a concatenation, not client evaluation.
