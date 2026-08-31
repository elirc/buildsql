## Hint 1

`$"..."` builds the whole sentence before the logger is called, so there is
nothing left for it to name. Pass the template *as the template* and the values
as arguments.

## Hint 2

    logger.LogInformation(
        "Pick {PickId} started for order {OrderRef}", pick.Id, pick.OrderRef);

The names inside the braces become the property names, and the arguments fill
them positionally - so the order of the arguments has to match the order of the
placeholders. You still get a readable rendered message for free.
