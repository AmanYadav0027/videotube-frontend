import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  userData: null,
  isLoading: true,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.userData = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userData = null;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Patch individual fields after profile updates (avatar, cover, account details)
    // without touching isAuthenticated or clearing the rest of the user object.
    updateUser: (state, action) => {
      if (state.userData) {
        state.userData = { ...state.userData, ...action.payload };
      }
    },
  },
});

export const { login, logout, setLoading, updateUser } = authSlice.actions;
export default authSlice.reducer;
