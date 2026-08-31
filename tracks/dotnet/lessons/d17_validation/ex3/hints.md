## Hint 1

The missing rule is about the pair, not about either field, so it cannot be
keyed to `startHour` or to `durationMinutes` without blaming something that is
not wrong. ASP.NET Core files model-level errors under the empty string.

## Hint 2

    if (errors.Count == 0 && start + body.DurationMinutes > D17Clinic.ClosesHour * 60)
        errors[""] = ["..."];

...placed after both field checks and before the `errors.Count > 0` decision.

The `errors.Count == 0` guard is half the exercise: when a field is already
invalid the sum means nothing, and a third message about it is noise. The gate
checks that `startHour = 7, durationMinutes = 5` reports two keys, not three.
