## Hint 1

The middleware's constructor already declares the two settings it needs. The
question is how they get there — `UseMiddleware` takes more than a type
argument.

Everything you do not pass is resolved from the container; everything you do
pass fills the constructor after `next`.

## Hint 2

`pipeline.UseMiddleware<BannerMiddleware>(headerName, value);`

The arguments line up with the constructor parameters *after* `RequestDelegate
next`, which the framework always supplies itself.

`InvokeAsync` is then two lines: set the named header, `return next(context);`.

In a published middleware package this would be wrapped in an extension method —
`app.UseBanner("X-Banner", "alpha")` — and usually take an options object rather
than loose strings, so adding a setting does not change the signature.
