// 04_lists_conditional / ex1 - reference solution.

export function TagList({ tags }: { tags: string[] }) {
  return (
    <ul>
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}
