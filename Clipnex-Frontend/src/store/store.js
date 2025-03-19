import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js";
import videoSlice from "./videoSlice.js";
import userSlice from "../store/userSlice.js";
import searchSlice from './searchSlice.js';


const store = configureStore({
  reducer: {
    auth: authSlice,
    videos: videoSlice,
    user: userSlice,
    search: searchSlice
  }
});

export default store;
