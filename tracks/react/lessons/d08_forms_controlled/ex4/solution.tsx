// d08_forms_controlled / ex4 - three fields, one object, one handler.
// See tracks/react/lessons/d08_forms_controlled/README.md, "Exercise 4".
import { useState, type ChangeEvent } from "react";

type Address = { street: string; city: string; postcode: string };

const EMPTY: Address = { street: "", city: "", postcode: "" };

export function AddressBlock({ onChange }: { onChange: (address: Address) => void }) {
  const [address, setAddress] = useState<Address>(EMPTY);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = { [event.target.name]: event.target.value } as Address;
    setAddress(next);
    onChange(next);
  }

  return (
    <>
      <label htmlFor="street">Street</label>
      <input id="street" name="street" value={address.street} onChange={handleChange} />

      <label htmlFor="city">City</label>
      <input id="city" name="city" value={address.city} onChange={handleChange} />

      <label htmlFor="postcode">Postcode</label>
      <input id="postcode" name="postcode" value={address.postcode} onChange={handleChange} />

      <button type="button">Clear</button>
    </>
  );
}
