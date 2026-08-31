// d08_forms_controlled / ex6 - reference solution.
import { useState } from "react";

export function CountryCity({ catalogue }: { catalogue: Record<string, string[]> }) {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const cities = country === "" ? [] : catalogue[country];

  return (
    <>
      <label htmlFor="country">Country</label>
      <select
        id="country"
        value={country}
        onChange={(event) => {
          setCountry(event.target.value);
          setCity("");
        }}
      >
        <option value="">Choose a country</option>
        {Object.keys(catalogue).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <label htmlFor="city">City</label>
      <select id="city" value={city} onChange={(event) => setCity(event.target.value)}>
        <option value="">Choose a city</option>
        {cities.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <button type="button" disabled={country === "" || city === ""}>
        Continue
      </button>
    </>
  );
}
