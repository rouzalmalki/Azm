/**
 * useComments — manages user comments per template.
 * Persisted in localStorage under "azm_comments".
 *
 * Shape: Record<templateId, Comment[]>
 */
import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface Comment {
  id: string;
  text: string;
  createdAt: string; // ISO date string
}

type CommentsMap = Record<string, Comment[]>;

export function useComments() {
  const [commentsMap, setCommentsMap] = useLocalStorage<CommentsMap>("azm_comments", {});

  /** Get comments for a specific template, sorted newest first. */
  const getComments = useCallback(
    (templateId: string): Comment[] => {
      const list = commentsMap[templateId] ?? [];
      return [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    [commentsMap]
  );

  /** Add a new comment to a template. */
  const addComment = useCallback(
    (templateId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const newComment: Comment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      setCommentsMap((prev) => ({
        ...prev,
        [templateId]: [...(prev[templateId] ?? []), newComment],
      }));
    },
    [setCommentsMap]
  );

  /** Remove a comment by id from a template. */
  const deleteComment = useCallback(
    (templateId: string, commentId: string) => {
      setCommentsMap((prev) => ({
        ...prev,
        [templateId]: (prev[templateId] ?? []).filter((c) => c.id !== commentId),
      }));
    },
    [setCommentsMap]
  );

  return { getComments, addComment, deleteComment };
}
