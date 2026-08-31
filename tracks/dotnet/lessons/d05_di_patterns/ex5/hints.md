## Hint 1

Two registrations that differ only by a key, and two different ways of asking
for one: an attribute on a parameter when the choice is fixed, and a lookup on
the provider when the key arrives with the request.

The route's key comes from a client, so the lookup must be able to fail politely.

## Hint 2

`services.AddKeyedSingleton<IChannel, EmailChannel>("email");` and the same for
`"sms"`.

In the handler:

- `[FromKeyedServices("email")] IChannel primary` for the pinned one
- `services.GetKeyedService<IChannel>(key)` for the route one — the non-`Required`
  form returns `null` instead of throwing, which is your 404
- `services.GetKeyedServices<IChannel>(KeyedService.AnyKey)` for all of them

`KeyedService.AnyKey` is the wildcard: "every keyed registration for this
service type, whatever its key".
