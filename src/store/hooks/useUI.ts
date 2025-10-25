import { useAppDispatch, useAppSelector } from "../hooks";
import type { UIState } from "../slices/uiSlice";
import {
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setFilter,
  clearFilter,
  setPagination,
  setSelectedItem,
  clearSelectedItems,
  toggleSidebar,
  setSidebarCollapsed,
} from "../slices/uiSlice";

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui as UIState);

  return {
    ...ui,
    openModal: (modal: Parameters<typeof openModal>[0]) => dispatch(openModal(modal)),
    closeModal: (modal: Parameters<typeof closeModal>[0]) => dispatch(closeModal(modal)),
    closeAllModals: () => dispatch(closeAllModals()),
    setLoading: (key: Parameters<typeof setLoading>[0]["key"], value: boolean) =>
      dispatch(setLoading({ key, value })),
    setFilter: (entity: Parameters<typeof setFilter>[0]["entity"], filters: Record<string, unknown>) =>
      dispatch(setFilter({ entity, filters })),
    clearFilter: (entity: Parameters<typeof clearFilter>[0]) => dispatch(clearFilter(entity)),
    setPagination: (
      entity: Parameters<typeof setPagination>[0]["entity"],
      page?: number,
      limit?: number
    ) => dispatch(setPagination({ entity, page, limit })),
    setSelectedItem: (key: Parameters<typeof setSelectedItem>[0]["key"], value: string | null) =>
      dispatch(setSelectedItem({ key, value })),
    clearSelectedItems: () => dispatch(clearSelectedItems()),
    toggleSidebar: () => dispatch(toggleSidebar()),
    setSidebarCollapsed: (collapsed: boolean) => dispatch(setSidebarCollapsed(collapsed)),
  };
};
