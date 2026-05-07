import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/communityAPI";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loadBuilds = createAsyncThunk(
  "community/loadBuilds",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchPublicBuilds(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load builds");
    }
  }
);

export const loadBuildDetail = createAsyncThunk(
  "community/loadBuildDetail",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchBuildById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load build");
    }
  }
);

export const submitRating = createAsyncThunk(
  "community/submitRating",
  async ({ buildId, value }, { rejectWithValue }) => {
    try {
      const { data } = await api.rateBuild(buildId, value);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to submit rating");
    }
  }
);

export const loadComments = createAsyncThunk(
  "community/loadComments",
  async ({ buildId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchComments(buildId, params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load comments");
    }
  }
);

export const submitComment = createAsyncThunk(
  "community/submitComment",
  async ({ buildId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.postComment(buildId, content);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to post comment");
    }
  }
);

export const removeComment = createAsyncThunk(
  "community/removeComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await api.deleteComment(commentId);
      return commentId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete comment");
    }
  }
);

export const reportComment = createAsyncThunk(
  "community/reportComment",
  async ({ commentId, reason }, { rejectWithValue }) => {
    try {
      await api.flagComment(commentId, reason);
      return commentId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to flag comment");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  builds: [],
  pagination: null,
  selectedBuild: null,
  comments: [],
  commentsPagination: null,

  loadingBuilds: false,
  loadingDetail: false,
  loadingComments: false,
  submittingComment: false,
  submittingRating: false,

  error: null,
  successMessage: null,
};

const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
    clearSelectedBuild: (state) => {
      state.selectedBuild = null;
      state.comments = [];
      state.commentsPagination = null;
    },
  },
  extraReducers: (builder) => {
    // Load builds
    builder
      .addCase(loadBuilds.pending, (state) => { state.loadingBuilds = true; state.error = null; })
      .addCase(loadBuilds.fulfilled, (state, action) => {
        state.loadingBuilds = false;
        state.builds = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(loadBuilds.rejected, (state, action) => {
        state.loadingBuilds = false;
        state.error = action.payload;
      });

    // Load detail
    builder
      .addCase(loadBuildDetail.pending, (state) => { state.loadingDetail = true; state.error = null; })
      .addCase(loadBuildDetail.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedBuild = action.payload;
      })
      .addCase(loadBuildDetail.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload;
      });

    // Submit rating
    builder
      .addCase(submitRating.pending, (state) => { state.submittingRating = true; })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.submittingRating = false;
        if (state.selectedBuild) {
          state.selectedBuild.avgRating = action.payload.avgRating;
          state.selectedBuild.ratingCount = action.payload.ratingCount;
          state.selectedBuild.userRating = action.payload.userRating;
        }
        state.successMessage = "Rating submitted!";
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.submittingRating = false;
        state.error = action.payload;
      });

    // Load comments
    builder
      .addCase(loadComments.pending, (state) => { state.loadingComments = true; })
      .addCase(loadComments.fulfilled, (state, action) => {
        state.loadingComments = false;
        state.comments = action.payload.data;
        state.commentsPagination = action.payload.pagination;
      })
      .addCase(loadComments.rejected, (state, action) => {
        state.loadingComments = false;
        state.error = action.payload;
      });

    // Submit comment
    builder
      .addCase(submitComment.pending, (state) => { state.submittingComment = true; })
      .addCase(submitComment.fulfilled, (state, action) => {
        state.submittingComment = false;
        state.comments.unshift(action.payload);
        state.successMessage = "Comment posted!";
      })
      .addCase(submitComment.rejected, (state, action) => {
        state.submittingComment = false;
        state.error = action.payload;
      });

    // Remove comment
    builder
      .addCase(removeComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c._id !== action.payload);
      });

    // Flag comment
    builder
      .addCase(reportComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c._id !== action.payload);
        state.successMessage = "Comment reported.";
      });
  },
});

export const { clearError, clearSuccess, clearSelectedBuild } = communitySlice.actions;
export default communitySlice.reducer;
