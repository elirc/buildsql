// d08_forms_controlled / ex1 - reference solution.
import { useState, type ChangeEvent } from "react";

export function NicknameField({ maxLength }: { maxLength: number }) {
  const [nickname, setNickname] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (next.length > maxLength || next.includes(" ")) {
      return;
    }
    setNickname(next);
  }

  return (
    <>
      <label htmlFor="nickname">Nickname</label>
      <input id="nickname" value={nickname} onChange={handleChange} />
      <p role="status">
        {nickname.length}/{maxLength}
      </p>
    </>
  );
}
