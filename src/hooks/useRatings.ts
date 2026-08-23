/**
 * useRatings — manages star ratings for templates.
 * Stored in localStorage under "azm_ratings".
 *
 * Shape per template:
 *   sum        — total of all submitted star values
 *   count      — number of ratings submitted (seeded from template base)
 *   userRating — the current user's rating (0 = not rated)
 */
import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface RatingEntry {
  sum: number;
  count: number;
  userRating: number;
}

type RatingsMap = Record<string, RatingEntry>;

export interface TemplateRatingInfo {
  average: number;       // rounded to 1 decimal
  count: number;         // total raters count (seeded + user contributions)
  userRating: number;    // 0 means not yet rated
}

const SEED_COUNT = 48; // base simulated community raters

export function useRatings() {
  const [ratingsMap, setRatingsMap] = useLocalStorage<RatingsMap>("azm_ratings", {});

  /** Retrieve combined rating info for a template. */
  const getTemplateRating = useCallback(
    (templateId: string, baseRating: number): TemplateRatingInfo => {
      const stored = ratingsMap[templateId];
      if (!stored) {
        return { average: baseRating, count: SEED_COUNT, userRating: 0 };
      }
      const avg = stored.count > 0 ? stored.sum / stored.count : baseRating;
      return {
        average: Math.round(avg * 10) / 10,
        count: stored.count,
        userRating: stored.userRating,
      };
    },
    [ratingsMap]
  );

  /** Submit or update a star rating. */
  const rateTemplate = useCallback(
    (templateId: string, rating: number, baseRating: number) => {
      setRatingsMap((prev) => {
        const existing = prev[templateId];
        if (existing && existing.userRating > 0) {
          // Replace previous user rating
          const newSum = existing.sum - existing.userRating + rating;
          return {
            ...prev,
            [templateId]: { sum: newSum, count: existing.count, userRating: rating },
          };
        }
        // First-time rating — seed community average
        const seedSum = baseRating * SEED_COUNT;
        return {
          ...prev,
          [templateId]: {
            sum: seedSum + rating,
            count: SEED_COUNT + 1,
            userRating: rating,
          },
        };
      });
    },
    [setRatingsMap]
  );

  return { getTemplateRating, rateTemplate };
}
