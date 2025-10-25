// Export all selectors
export * from "./clientSelectors";
export * from "./jobSelectors";
export * from "./candidateSelectors";
export * from "./applicationSelectors";

// Simple selectors for other entities
export const selectCategories = (state: any) => state.categories.categories;
export const selectTags = (state: any) => state.tags.tags;
export const selectTeam = (state: any) => state.team.teamMembers;
export const selectEmails = (state: any) => state.emails.emails;
export const selectPipelines = (state: any) => state.pipelines.pipelines;
export const selectInterviews = (state: any) => state.interviews.interviews;
export const selectUsers = (state: any) => state.users.users;
