import { createSlice } from "@reduxjs/toolkit";

const historySlice = createSlice({
  name: "history",
  initialState: {
    items: [],
  },
  reducers: {
    addToHistory: (state, action) => {
      state.items.push(action.payload);
    },
    clearHistory: (state) => {
      state.items = [];
    },
  },
});

export const { addToHistory, clearHistory } = historySlice.actions;

export default historySlice.reducer;
