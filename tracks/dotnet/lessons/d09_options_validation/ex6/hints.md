## Hint 1

`FullPath` is derived from two other values, so it can only be computed once
those values are final — after binding, after any `Configure`.

There is a registration whose whole purpose is "run last".

## Hint 2

```csharp
services.PostConfigure<ReportOptions>(options =>
{
    if (string.IsNullOrWhiteSpace(options.FileName))
    {
        options.FileName = "report.csv";
    }

    options.FullPath = $"{options.Folder}/{options.FileName}";
});
```

The order in the options pipeline is: `Configure` → binding → `PostConfigure` →
validation. So this sees the final values, and anything validating afterwards
sees the derived ones.

Note the `if`. Assigning `FileName` unconditionally would take the operator's
configured value away — and that is a confusing bug to be on the receiving end
of, because the setting is right there in the file doing nothing.
