import { describe, expect, it } from "vitest";
import { INITIAL_EASE, nextReviewDate } from "./srs";

const NOW = new Date("2026-01-15T00:00:00.000Z");

function daysFromNow(days: number): Date {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

describe("nextReviewDate", () => {
  it("schedules a first-ever success +1 day from now", () => {
    const result = nextReviewDate(
      { intervalDays: 0, ease: INITIAL_EASE },
      "got",
      NOW,
    );
    expect(result).toEqual(daysFromNow(1));
  });

  it("schedules a first-ever miss +1 day from now", () => {
    const result = nextReviewDate(
      { intervalDays: 0, ease: INITIAL_EASE },
      "missed",
      NOW,
    );
    expect(result).toEqual(daysFromNow(1));
  });

  it("uses the SM-2 second-step of 6 days when intervalDays is 1 and rating is got", () => {
    const result = nextReviewDate(
      { intervalDays: 1, ease: INITIAL_EASE },
      "got",
      NOW,
    );
    expect(result).toEqual(daysFromNow(6));
  });

  it("multiplies the previous interval by ease for an established card on got", () => {
    const result = nextReviewDate(
      { intervalDays: 10, ease: 2.5 },
      "got",
      NOW,
    );
    expect(result).toEqual(daysFromNow(25));
  });

  it("resets an established card to +1 day on miss, regardless of prior interval", () => {
    const result = nextReviewDate(
      { intervalDays: 100, ease: 2.5 },
      "missed",
      NOW,
    );
    expect(result).toEqual(daysFromNow(1));
  });

  it("scales the interval correctly with a very high ease factor", () => {
    const result = nextReviewDate(
      { intervalDays: 20, ease: 3.5 },
      "got",
      NOW,
    );
    expect(result).toEqual(daysFromNow(70));
  });
});
