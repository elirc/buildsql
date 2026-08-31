## Hint 1

Filters nest rather than queue. Work out which one has to be *outermost* — the
one that must still be running when everything else has finished — and which one
has to be *innermost*, closest to the handler.

Then remember there are two places to attach a filter: the group, and the
endpoint.

## Hint 2

Three rules decide everything here:

- a group's filters run outside the endpoint's filters
- within one builder, the first filter added is the outermost
- the mark in the trace goes on the way in, and again on the way out

So `c` — the only one between the innermost group filter and the handler — has
to be attached with `.AddEndpointFilter(...)` on the `MapGet` itself, and `a`
has to be added to the group before `b`.

## Hint 3

`ReportFilter` answers with `D02Trace.Read(...)` after awaiting `next`, so it has
to be outside every mark or it will report a half-finished trace — which means
adding it to the group **first**, before `a`.

```csharp
group.AddEndpointFilter(new ReportFilter());
group.AddEndpointFilter(new MarkFilter("a"));
…
```

Left for you: the remaining two lines, and convincing yourself why swapping any
two of them changes the answer.
