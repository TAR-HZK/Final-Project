import axiosInstance from "./axiosInstance"; // Your existing centralized Axios instance

// ─── Feed ─────────────────────────────────────────────────────────────────────
export const fetchPublicBuilds = (params) =>
  axiosInstance.get("/community/builds", { params });

export const fetchBuildById = (id) =>
  axiosInstance.get(`/community/builds/${id}`);

// ─── Ratings ──────────────────────────────────────────────────────────────────
export const rateBuild = (buildId, value) =>
  axiosInstance.post(`/community/builds/${buildId}/rate`, { value });

// ─── Comments ─────────────────────────────────────────────────────────────────
export const fetchComments = (buildId, params) =>
  axiosInstance.get(`/community/builds/${buildId}/comments`, { params });

export const postComment = (buildId, content) =>
  axiosInstance.post(`/community/builds/${buildId}/comments`, { content });

export const deleteComment = (commentId) =>
  axiosInstance.delete(`/community/comments/${commentId}`);

export const flagComment = (commentId, reason) =>
  axiosInstance.patch(`/community/comments/${commentId}/flag`, { reason });

// ─── Admin ────────────────────────────────────────────────────────────────────
export const fetchFlaggedComments = () =>
  axiosInstance.get("/community/admin/flagged");

export const unflagComment = (commentId) =>
  axiosInstance.patch(`/community/admin/comments/${commentId}/unflag`);
