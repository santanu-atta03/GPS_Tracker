import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loding: false,
    usere: null,
  },
  reducers: {
    setLoding: (state, action) => {
      state.loding = action.payload;
    },
    setuser: (state, action) => {
      state.usere = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setLoding, setuser } = authSlice.actions;

export default authSlice.reducer;
