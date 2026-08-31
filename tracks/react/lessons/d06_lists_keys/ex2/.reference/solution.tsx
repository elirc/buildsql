// d06_lists_keys / ex2 - reference solution.

export function HighScores({ scores }: { scores: { name: string; points: number }[] }) {
  const ranked = [...scores].sort((a, b) => b.points - a.points);

  return (
    <ul>
      {ranked.map((score) => (
        <li key={score.name}>
          {score.name} - {score.points}
        </li>
      ))}
    </ul>
  );
}
