## Hint 1

`{@Request}` logs every property the object has - including the one you would
never have written down deliberately, and including the ones somebody adds next
quarter without looking at this line.

## Hint 2

Name the two fields the log actually needs:

    logger.LogInformation("Dispatched {OrderRef} with {Courier}", pick.OrderRef, courier.Name);

The courier's NAME rather than its code, because a human reading the log should
not have to look up "fw". The token appears nowhere - the gate scans every
captured entry's message and every state value for it.
