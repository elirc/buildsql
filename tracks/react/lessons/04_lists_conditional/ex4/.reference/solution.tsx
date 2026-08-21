// 04_lists_conditional / ex4 - reference solution.

type Player = { name: string; score: number };

export function Leaderboard({ players }: { players: Player[] }) {
  const top = [...players]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 3);

  return (
    <ol>
      {top.map((player) => (
        <li key={player.name}>
          {player.name}: {player.score}
        </li>
      ))}
    </ol>
  );
}
