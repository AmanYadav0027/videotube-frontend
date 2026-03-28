import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tweets: false,
  notifications: false,
  // You can add more here later like 'messages: false'
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Action to turn the red dot ON
    triggerUnread: (state, action) => {
      const key = action.payload; // e.g., "tweets"
      if (key in state) {
        state[key] = true;
      }
    },
    // Action to turn the red dot OFF
    markAsRead: (state, action) => {
      const key = action.payload;
      if (key in state) {
        state[key] = false;
      }
    },
  },
});

export const { triggerUnread, markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
