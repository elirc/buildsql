## Hint 1

`status is null` is the "no filter" case and is legal. A status that is present
but is not one of `D15Network.Statuses` is a different thing entirely: the
client asked a question the server does not have a vocabulary for.

## Hint 2

Guard before you filter:

    if (status is not null && !D15Network.Statuses.Contains(status))
        return TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            ["status"] = ["..."],
        });

`retired` is in the list, so it falls through the guard and legitimately
returns 200 with an empty array. That contrast is the whole exercise.
