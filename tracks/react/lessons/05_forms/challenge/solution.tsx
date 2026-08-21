// 05_forms / challenge - per-field errors, wired to their fields.
// See tracks/react/lessons/05_forms/README.md, "Challenge".
import { useState } from "react";

export function AddressForm({
  onSubmit,
}: {
  onSubmit: (address: { street: string; postcode: string }) => void;
}) {
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ street, postcode });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="street">Street</label>
      <input id="street" value={street} onChange={(event) => setStreet(event.target.value)} />

      <label htmlFor="postcode">Postcode</label>
      <input
        id="postcode"
        value={postcode}
        onChange={(event) => setPostcode(event.target.value)}
      />

      <button type="submit">Save address</button>
    </form>
  );
}
