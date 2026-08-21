// 05_forms / ex1 - reference solution.
import { useState } from "react";

export function NameField() {
  const [name, setName] = useState("");

  return (
    <>
      <label htmlFor="full-name">Full name</label>
      <input
        id="full-name"
        value={name}
        onChange={(event) => setName(event.target.value.toUpperCase())}
      />
      <output>{name.length} characters</output>
    </>
  );
}
