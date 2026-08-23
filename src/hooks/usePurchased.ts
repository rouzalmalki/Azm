/**
 * usePurchased — tracks template IDs that have been paid for.
 * Persisted in localStorage under "azm_purchased".
 *
 * Shape: Record<templateId, { purchasedAt: ISO string; sessionId: string }>
 */
import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface PurchasedEntry {
  purchasedAt: string;
  sessionId: string;
}

export type PurchasedMap = Record<string, PurchasedEntry>;

export interface UsePurchasedResult {
  purchased: PurchasedMap;
  isPurchased: (templateId: string) => boolean;
  addPurchased: (templateIds: string[], sessionId: string) => void;
}

export function usePurchased(): UsePurchasedResult {
  const [purchased, setPurchased] = useLocalStorage<PurchasedMap>("azm_purchased", {});

  const isPurchased = useCallback(
    (templateId: string) => Boolean(purchased[templateId]),
    [purchased]
  );

  const addPurchased = useCallback(
    (templateIds: string[], sessionId: string) => {
      const now = new Date().toISOString();
      const entries: PurchasedMap = {};
      templateIds.forEach((id) => {
        entries[id] = { purchasedAt: now, sessionId };
      });
      setPurchased((prev) => ({ ...prev, ...entries }));
    },
    [setPurchased]
  );

  return { purchased, isPurchased, addPurchased };
}
