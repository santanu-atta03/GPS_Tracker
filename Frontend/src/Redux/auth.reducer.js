import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loding: false,
    usere: null,
    path:null
  },
  reducers: {
    setLoding: (state, action) => {
      state.loding = action.payload;
    },
    setuser: (state, action) => {
      state.usere = action.payload;
    },
    setpath: (state, action) => {
      state.path = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setLoding, setuser ,setpath} = authSlice.actions;

export default authSlice.reducer;
