// Spaced-repetition scheduling primitive. Not yet wired into the UI —
// PROJECT.md keeps SRS for v2 — but the pure math is testable on its own
// and the v2 review-state schema can grow around this signature.

export type ReviewState = {
  /** Days since the previous review's interval; 0 for a never-reviewed card. */
  intervalDays: number;
  /** Multiplier applied to subsequent intervals on success. SM-2 starts at 2.5. */
  ease: number;
};

export const INITIAL_EASE = 2.5;

/**
 * Returns the next due date for a flashcard given its prior review state and
 * the rating just recorded. Pure: pass `now` explicitly so tests don't depend
 * on wall-clock time.
 */
export function nextReviewDate(
  state: ReviewState,
  rating: "got" | "missed",
  now: Date,
): Date {
  const intervalDays =
    rating === "missed"
      ? 1
      : state.intervalDays === 0
        ? 1
        : state.intervalDays === 1
          ? 6
          : Math.round(state.intervalDays * state.ease);

  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + intervalDays);
  return next;
}
