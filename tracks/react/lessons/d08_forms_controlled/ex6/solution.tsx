// d08_forms_controlled / ex6 - the second select depends on the first.
// See tracks/react/lessons/d08_forms_controlled/README.md, "Exercise 6".
import { useState } from "react";

export function CountryCity({ catalogue }: { catalogue: Record<string, string[]> }) {
  const countries = Object.keys(catalogue);
  const [country, setCountry] = useState(countries[0]);
  const [city, setCity] = useState("");

  return (
    <>
      <label htmlFor="country">Country</label>
      <select id="country" value={country} onChange={(event) => setCountry(event.target.value)}>
        {countries.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <label htmlFor="city">City</label>
      <select id="city" value={city} onChange={(event) => setCity(event.target.value)}>
        <option value="">Choose a city</option>
        {catalogue[country].map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <button type="button">Continue</button>
    </>
  );
}
