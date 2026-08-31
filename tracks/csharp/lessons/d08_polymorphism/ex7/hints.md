## Hint 1

Two things happen at every link, and separating them is the whole exercise:

- what it does to the request on the way DOWN (Upper changes it before passing
  it on);
- what it does to the answer on the way BACK UP (Tag wraps whatever came back).

`Continue` is the hinge. It is three tokens: if there is no next link, hand the
request back unchanged.

## Hint 2

```csharp
protected string Continue(string request) => Next is null ? request : Next.Handle(request);
```

Then each link is one expression:

```csharp
Continue(request.ToUpperInvariant());   // changes the request going down
"<" + Continue(request) + ">";          // changes the answer coming back
```

`BlockMiddleware` is the interesting one: it returns *without* calling
`Continue`, which is how a link short-circuits the rest of the chain. Trace
`chain.Handle("bad news")` by hand: Tag calls Continue, Upper upper-cases and
calls Continue, Block sees "bad" and returns "BLOCKED" - and that string then
travels back up through Tag, which still wraps it. Links above a short circuit
still run their "on the way back" half.

This is exactly how ASP.NET Core's middleware pipeline works, and being able to
say "the response passes back through everything that ran before the terminal
middleware" is a good interview answer.
