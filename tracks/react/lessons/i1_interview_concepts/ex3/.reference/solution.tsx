// i1_interview_concepts / ex3 - reference solution.
import { useState } from "react";

export function NicknameForm({ onSave }: { onSave: (nickname: string) => void }) {
  const [nickname, setNickname] = useState("");

  return (
    <>
      <label htmlFor="nickname">Nickname</label>
      <input
        id="nickname"
        value={nickname}
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
