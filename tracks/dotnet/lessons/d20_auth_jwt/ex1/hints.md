## Hint 1

Four checks are switched off, and each one answers a different question: was
this signed with my key, by an issuer I trust, for my audience, and is it still
in date? Turn each back on - and give it the value it needs from `D20Jwt`.

## Hint 2

`ValidateIssuer = true` on its own is not enough; it needs `ValidIssuer`. The
same goes for `ValidAudience` and `IssuerSigningKey`.

And delete the `SignatureValidator` line entirely. Setting it replaces the
signature check with "parse the token and believe it", so no combination of the
other flags can save you while it is there.
