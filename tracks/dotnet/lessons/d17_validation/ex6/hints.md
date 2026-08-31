## Hint 1

Each of the two rules has two branches, and the second branch is the one that is
easy to forget: a permit is *required* when the species is exotic and
*forbidden* when it is not; a note is required with sedation and forbidden
without it.

## Hint 2

    if (body.Species == "exotic")
    {
        // blank or not matching ^EX-[0-9]{4}$  ->  errors["permitNumber"]
    }
    else if (!string.IsNullOrWhiteSpace(body.PermitNumber))
    {
        errors["permitNumber"] = ["Only an exotic visit carries a permit number."];
    }

...and the same `if/else if` shape for `Sedation` and `SedationNote`.

The three rules are independent, so an unknown species does not stop the other
two from firing - the gate sends `llama` with a permit and an unexplained
sedation and expects all three keys.
