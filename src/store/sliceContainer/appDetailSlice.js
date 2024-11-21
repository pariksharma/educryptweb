import { createSlice } from "@reduxjs/toolkit";

export const appDetailSlice = createSlice({
    name: 'appDetial',
    initialState: {
        app_detail: 'detail',
    },
    reducers: {
        app_detailAction: (state, action) => {
            // localStorage.setItem('appId', action?.payload?.id);
            // console.log('payload', action.payload)
            state.app_detail = action?.payload
        }
    }
})

export const {app_detailAction} = appDetailSlice.actions;
export default appDetailSlice.reducer;