import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import buildService from './buildService';

const initialState = {
  builds: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new build
export const createBuild = createAsyncThunk('builds/create', async (buildData, thunkAPI) => {
  try {
    // We grab the token directly from the Auth state!
    const token = thunkAPI.getState().auth.user.token;
    return await buildService.createBuild(buildData, token);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get all builds
export const getBuilds = createAsyncThunk('builds/getAll', async (_, thunkAPI) => {
  try {
    return await buildService.getBuilds();
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const buildSlice = createSlice({
  name: 'build',
  initialState,
  reducers: {
    resetBuilds: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBuild.pending, (state) => { state.isLoading = true; })
      .addCase(createBuild.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Add the new build directly to the UI without reloading
        state.builds.unshift(action.payload); 
      })
      .addCase(createBuild.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getBuilds.pending, (state) => { state.isLoading = true; })
      .addCase(getBuilds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.builds = action.payload;
      })
      .addCase(getBuilds.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetBuilds } = buildSlice.actions;
export default buildSlice.reducer;