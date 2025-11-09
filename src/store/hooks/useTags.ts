import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchTagById,
  createTag,
  updateTag,
  deleteTag,
  setCurrentTag,
} from "../slices/tagsSlice";
import type { Tag } from "@/types";
import { useTags as useFirestoreTags } from "@/hooks/firestore";

export const useTags = () => {
  const dispatch = useAppDispatch();
  
  // Get realtime data from Firestore
  const { data: tags, loading: isLoading, error: firestoreError } = useFirestoreTags();
  
  // Keep currentTag from Redux for backward compatibility
  const { currentTag } = useAppSelector(
    (state) => state.tags
  );

  // Fetch functions are now no-ops since Firestore provides realtime data
  const fetchTagsCallback = useCallback(() => Promise.resolve(), []);
  const fetchTagByIdCallback = useCallback((_id: string) => dispatch(fetchTagById(_id)), [dispatch]);
  
  // Write operations still go through Redux/API for validation
  const createTagCallback = useCallback((data: Partial<Tag>) => dispatch(createTag(data)), [dispatch]);
  const updateTagCallback = useCallback((id: string, data: Partial<Tag>) =>
      dispatch(updateTag({ id, data })), [dispatch]);
  const deleteTagCallback = useCallback((id: string) => dispatch(deleteTag(id)), [dispatch]);
  const setCurrentTagCallback = useCallback((tag: Tag | null) => dispatch(setCurrentTag(tag)), [dispatch]);

  return {
    tags, // Now from Firestore with realtime updates!
    currentTag,
    isLoading,
    error: firestoreError,
    fetchTags: fetchTagsCallback,
    fetchTagById: fetchTagByIdCallback,
    createTag: createTagCallback,
    updateTag: updateTagCallback,
    deleteTag: deleteTagCallback,
    setCurrentTag: setCurrentTagCallback,
  };
};
