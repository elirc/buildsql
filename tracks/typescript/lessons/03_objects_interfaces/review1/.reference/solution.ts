// 03_objects_interfaces / review1 - reference solution (author only).

export interface Learner {
  name: string;
  streak: number;
  nickname?: string;
}

export function greetLearner(learner: Learner): string {
  const shown = learner.nickname ?? learner.name;
  if (learner.streak === 0) {
    return `${shown} - no streak yet`;
  }
  return `${shown} - ${learner.streak} day streak`;
}
