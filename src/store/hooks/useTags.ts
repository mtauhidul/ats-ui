import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchTags,
  fetchTagById,
  createTag,
  updateTag,
  deleteTag,
  setCurrentTag,
} from "../slices/tagsSlice";
import type { Tag } from "@/types";

export const useTags = () => {
  const dispatch = useAppDispatch();
  const { tags, currentTag, isLoading, error } = useAppSelector(
    (state) => state.tags
  );

  const fetchTagsCallback = useCallback(() => dispatch(fetchTags()), [dispatch]);
  const fetchTagByIdCallback = useCallback((id: string) => dispatch(fetchTagById(id)), [dispatch]);
  const createTagCallback = useCallback((data: Partial<Tag>) => dispatch(createTag(data)), [dispatch]);
  const updateTagCallback = useCallback((id: string, data: Partial<Tag>) =>
      dispatch(updateTag({ id, data })), [dispatch]);
  const deleteTagCallback = useCallback((id: string) => dispatch(deleteTag(id)), [dispatch]);
  const setCurrentTagCallback = useCallback((tag: Tag | null) => dispatch(setCurrentTag(tag)), [dispatch]);

  return {
    tags,
    currentTag,
    isLoading,
    error,
    fetchTags: fetchTagsCallback,
    fetchTagById: fetchTagByIdCallback,
    createTag: createTagCallback,
    updateTag: updateTagCallback,
    deleteTag: deleteTagCallback,
    setCurrentTag: setCurrentTagCallback,
  };
};
