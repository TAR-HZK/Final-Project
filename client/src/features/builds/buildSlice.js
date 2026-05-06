import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import buildService from './buildService';
import axios from 'axios'; // We need axios for the new direct API calls

const initialState = {
  builds: [],
  communityBuilds: [], // Added this so the Tavern doesn't overwrite your personal ledger
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new build
export const createBuild = createAsyncThunk('builds/create', async (buildData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await buildService.createBuild(buildData, token);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get user's personal builds
export const getBuilds = createAsyncThunk('builds/getAll', async (_, thunkAPI) => {
  try {
    // 1. Grab the user's token from Redux state
    const token = thunkAPI.getState().auth.user.token;
    
    // 2. Put the token in the auth header
    const config = {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    };
    
    // 3. Make the request securely (Adjust URL if needed)
    const response = await axios.get('http://localhost:5000/api/builds', config);
    
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// NEW: Update user build (e.g., publishing to Tavern)
export const updateBuild = createAsyncThunk('builds/update', async ({ id, buildData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Change this URL if your backend route is different!
    const response = await axios.put(`http://localhost:5000/api/builds/${id}`, buildData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// NEW: Get public community builds for the Tavern
export const getCommunityBuilds = createAsyncThunk('builds/getCommunity', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Change this URL if your backend route is different!
    const response = await axios.get('http://localhost:5000/api/builds/community', config);
    return response.data;
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
      // CREATE BUILD
      .addCase(createBuild.pending, (state) => { state.isLoading = true; })
      .addCase(createBuild.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.builds.unshift(action.payload); 
      })
      .addCase(createBuild.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // GET PERSONAL BUILDS
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
      })

      // UPDATE BUILD
      .addCase(updateBuild.pending, (state) => { state.isLoading = true; })
      .addCase(updateBuild.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update the specific build in the personal list
        state.builds = state.builds.map((build) => 
          build._id === action.payload._id ? action.payload : build
        );
      })
      .addCase(updateBuild.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // GET COMMUNITY BUILDS
      .addCase(getCommunityBuilds.pending, (state) => { state.isLoading = true; })
      .addCase(getCommunityBuilds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.communityBuilds = action.payload; // Saves to the separate community array
      })
      .addCase(getCommunityBuilds.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetBuilds } = buildSlice.actions;
export default buildSlice.reducer;