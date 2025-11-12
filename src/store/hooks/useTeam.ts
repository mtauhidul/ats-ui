import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  setCurrentMember,
} from "../slices/teamSlice";
import type { TeamState } from "../slices/teamSlice";
import type { TeamMember } from "@/types";
import { useTeamMembers as useFirestoreTeamMembers } from "@/hooks/firestore";

/**
 * 🔥 REALTIME: Redux hook now wraps Firestore hook for backward compatibility
 * Data comes from Firestore realtime subscriptions - no more API calls!
 */
export const useTeam = () => {
  const dispatch = useAppDispatch();
  const { currentMember } = useAppSelector(
    (state) => state.team as TeamState
  );

  // 🔥 Get team members from Firestore realtime subscription
  const { data: teamMembers, loading: isLoading, error } = useFirestoreTeamMembers();

  // No-op fetchTeam for backward compatibility - Firestore auto-subscribes
  const fetchTeamCallback = useCallback(() => {
    return Promise.resolve();
  }, []);

  const fetchTeamMemberByIdCallback = useCallback((id: string) => dispatch(fetchTeamMemberById(id)), [dispatch]);
  const createTeamMemberCallback = useCallback((data: Partial<TeamMember>) => dispatch(createTeamMember(data)), [dispatch]);
  const updateTeamMemberCallback = useCallback((id: string, data: Partial<TeamMember>) =>
      dispatch(updateTeamMember({ id, data })), [dispatch]);
  const deleteTeamMemberCallback = useCallback((id: string) => dispatch(deleteTeamMember(id)), [dispatch]);
  const setCurrentMemberCallback = useCallback((member: TeamMember | null) =>
      dispatch(setCurrentMember(member)), [dispatch]);

  return {
    teamMembers,
    currentMember,
    isLoading,
    error: error?.message,
    fetchTeam: fetchTeamCallback,
    fetchTeamMemberById: fetchTeamMemberByIdCallback,
    createTeamMember: createTeamMemberCallback,
    updateTeamMember: updateTeamMemberCallback,
    deleteTeamMember: deleteTeamMemberCallback,
    setCurrentMember: setCurrentMemberCallback,
  };
};
