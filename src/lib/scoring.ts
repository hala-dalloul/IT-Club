import { CHARACTERS, QUESTIONS, SPEC_BY_ID, type SpecId, type Specialization } from "./game-data";

export interface GameResult {
  /** Best matching specialization */
  top: Specialization;
  /** Second path shown when scores are close */
  second: Specialization | null;
  /** True when top two paths are within the closeness threshold */
  closeMatch: boolean;
}

/** If the top two paths are within this many points, both are recommended. */
const CLOSE_THRESHOLD = 2;

export function computeScores(answers: (number | null)[], characterId: SpecId | null): Record<SpecId, number> {
  const totals: Record<SpecId, number> = {
    multimedia: 0,
    web: 0,
    games: 0,
    software: 0,
    mobile: 0,
  };

  answers.forEach((optionIndex, qIndex) => {
    if (optionIndex === null) return;
    const option = QUESTIONS[qIndex]?.options[optionIndex];
    if (!option) return;
    for (const [spec, points] of Object.entries(option.scores)) {
      totals[spec as SpecId] += points ?? 0;
    }
  });

  if (characterId) {
    const character = CHARACTERS.find((c) => c.id === characterId);
    if (character) totals[character.id] += character.boost;
  }

  return totals;
}

export function computeResult(answers: (number | null)[], characterId: SpecId | null): GameResult {
  const totals = computeScores(answers, characterId);
  const ranked = (Object.entries(totals) as [SpecId, number][]).sort((a, b) => b[1] - a[1]);

  const first = ranked[0];
  const second = ranked[1];
  if (!first || !second) {
    return { top: SPEC_BY_ID.multimedia, second: null, closeMatch: false };
  }

  const [topId, topScore] = first;
  const [secondId, secondScore] = second;
  const closeMatch = topScore - secondScore <= CLOSE_THRESHOLD;

  return {
    top: SPEC_BY_ID[topId],
    second: closeMatch ? SPEC_BY_ID[secondId] : null,
    closeMatch,
  };
}
