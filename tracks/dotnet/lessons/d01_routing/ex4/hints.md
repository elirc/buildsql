## Hint 1

Four beats: resolve the default day, reject a day that is not a day, reject a
line that is not a line, then build the hours.

The template is already correct — `{day?}` is why `/timetable` with nothing
after it still reaches your handler, with `day` bound to `null`.

## Hint 2

Start with `string when = day ?? "weekday";` and use `when` everywhere after
that. A single resolved value beats sprinkling null checks through the method.

`weekend` means "drop everything before 09:00", so the filter is
`when == "weekday" || d.Hour >= 9`.

Then `Select(d => d.Hour).Distinct().OrderBy(h => h)` — N1 has two departures at
07:00 and the timetable must not list the hour twice.
