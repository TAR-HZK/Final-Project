import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDashboardStats } from "../api/adminAPI";

export const loadDashboard = createAsyncThunk(
  "adminDashboard/load",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchDashboardStats();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load dashboard");
    }
  }
);

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: {
    stats: null,
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearDashboardError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(loadDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
