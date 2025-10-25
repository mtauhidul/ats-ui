import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchTeamMembers,
  fetchTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  setCurrentMember,
} from "../slices/teamSlice";
import type { TeamState } from "../slices/teamSlice";
import type { TeamMember } from "@/types";

export const useTeam = () => {
  const dispatch = useAppDispatch();
  const { teamMembers, currentMember, isLoading, error } = useAppSelector(
    (state) => state.team as TeamState
  );

  const fetchTeamCallback = useCallback(() => dispatch(fetchTeamMembers()), [dispatch]);
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
    error,
    fetchTeam: fetchTeamCallback,
    fetchTeamMemberById: fetchTeamMemberByIdCallback,
    createTeamMember: createTeamMemberCallback,
    updateTeamMember: updateTeamMemberCallback,
    deleteTeamMember: deleteTeamMemberCallback,
    setCurrentMember: setCurrentMemberCallback,
  };
};
