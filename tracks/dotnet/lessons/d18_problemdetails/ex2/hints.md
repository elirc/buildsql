## Hint 1

Two answers, ex1's shape for both. What is new is the 409: it needs a `type`
URI, because a client must be able to tell this conflict from every other one
this API could ever return, and it needs the numbers as data rather than as
English.

## Hint 2

`TypedResults.Problem` takes `type:` and `extensions:`:

    extensions: new Dictionary<string, object?>
    {
        ["sailingCode"] = sailing.Code,
        ["seatsLeft"] = sailing.Left,
    }

Extension members serialize at the TOP level of the body, beside `type` and
`status` - they are not nested under anything. Send `seatsLeft` even when it is
zero; an absent field and a zero mean different things.
