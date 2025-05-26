import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userProfile: null,
        isAuthenticated: false
    },
    reducers: {
        getProfile: (state, action) => {
            state.userProfile = action.payload
        },
        setAuthentication: (state, action) => {
            state.isAuthenticated = action.payload;
        },
      
    }
});

export const { 
    getProfile, 
    setAuthentication
} = userSlice.actions;

export default userSlice.reducer;