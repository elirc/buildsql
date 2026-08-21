## Hint 1

The endpoint body is the same shape as ex1's: read `Id` from both parameters,
wrap them in `ScopeResponse`, return 200.

The registration is the exercise. Write down the two requirements as a table —
same within a request, different across requests — and check each of the three
lifetimes against both rows. Two of them fail one row each.

## Hint 2

`AddTransient` gives a new object on every resolution, so it fails "same within
a request". `AddSingleton` gives one object forever, so it fails "different
across requests". There is a third method.

Its name is the same word the README uses for the boundary ASP.NET Core creates
around each request.

## Hint 3

```csharp
services.AddScoped<IRequestScope, RequestScope>();
```

That is the whole registration change. If the gate still complains that the two
values within one request differ, you edited the wrong line — check that the
old `AddTransient` is gone rather than sitting above the new line, because the
last registration for a service type is the one that wins.
