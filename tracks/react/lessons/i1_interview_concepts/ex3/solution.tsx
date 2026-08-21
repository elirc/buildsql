// i1_interview_concepts / ex3 - "the Reset button does nothing. Why?"
// See tracks/react/lessons/i1_interview_concepts/README.md, "Exercise 3".
import { useState } from "react";

export function NicknameForm({ onSave }: { onSave: (nickname: string) => void }) {
  const [nickname, setNickname] = useState("");

  return (
    <>
      <label htmlFor="nickname">Nickname</label>
      <input
        id="nickname"
        defaultValue={nickname}
        onChange={(event) => setNickname(event.target.value)}
      />
      <output>{nickname.length} characters</output>
      <button type="button" onClick={() => onSave(nickname)}>
        Save
      </button>
      <button type="button" onClick={() => setNickname("")}>
        Reset
      </button>
    </>
  );
}
