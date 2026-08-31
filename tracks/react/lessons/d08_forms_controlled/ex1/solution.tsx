// d08_forms_controlled / ex1 - the state decides what the box may contain.
// See tracks/react/lessons/d08_forms_controlled/README.md, "Exercise 1".
import { useState } from "react";

export function NicknameField({ maxLength }: { maxLength: number }) {
  const [nickname, setNickname] = useState("");

  return (
    <>
      <label htmlFor="nickname">Nickname</label>
      <input
        id="nickname"
        defaultValue={nickname}
        onChange={(event) => setNickname(event.target.value)}
      />
      <p role="status">{nickname.length} characters</p>
    </>
  );
}
