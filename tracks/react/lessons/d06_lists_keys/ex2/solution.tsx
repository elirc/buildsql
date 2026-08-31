// d06_lists_keys / ex2 - rank the scores without disturbing the caller.
// See tracks/react/lessons/d06_lists_keys/README.md, "Exercise 2".

export function HighScores({ scores }: { scores: { name: string; points: number }[] }) {
  return (
    <ul>
      {scores.reverse().map((score) => (
        <li key={score.name}>
          {score.name} - {score.points}
        </li>
      ))}
    </ul>
  );
}
