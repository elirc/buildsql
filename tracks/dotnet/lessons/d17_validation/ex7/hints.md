## Hint 1

Four kinds of failure, in a fixed order. The URL first: an unknown vet code is a
404, because the resource named in the path does not exist and nothing about the
body can be judged yet.

Then everything the client could fix by looking at its own payload - species,
hour, duration, and ex3's cross-field rule - as a 400.

## Hint 2

Only after all of that comes the check that is not about the payload at all:
`vet.Treats.Contains(body.Species)`. There is no field to key an error under,
because no field is wrong.

    return TypedResults.Problem(
        statusCode: StatusCodes.Status422UnprocessableEntity,
        title: "...",
        detail: "...");

## Hint 3

You do not have to do anything about a body that is not JSON. The binder fails
before your handler runs and the framework answers 400 by itself - the gate
checks that only to make sure you have not wrapped the binding in a
`try`/`catch` that turns it into a 500.
