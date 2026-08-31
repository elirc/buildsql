## Hint 1

Three answers, and the middle one is the exercise. The id is unknown: 404. The
job is there and the request is well formed, but its status will not allow this
transition: that is neither the client's fault nor a missing resource.

## Hint 2

`D16Queue.Finished` is the list of terminal statuses. When the job's status is
in it, return
`TypedResults.Problem(statusCode: StatusCodes.Status409Conflict, title: ..., detail: ...)`
and change nothing - the gate re-reads the row to check.

Otherwise set `Status` to `"cancelled"`, bump `Version`, save, and answer 204.
