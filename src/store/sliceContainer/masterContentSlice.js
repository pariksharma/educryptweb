import { createSlice } from "@reduxjs/toolkit";

export const masterContentSlice = createSlice({
    name: 'home',
    initialState: {
        allCategory: '',
        allCourse: '',
        allCurrentAffair: '',
        content: '',
        review: '',
        versionData: '',
        tabName: '',
        profileDetail: '',
    },
    reducers: {
        all_CategoryAction: (state, action) => {
            state.allCategory = action.payload
        },
        all_CourseAction: (state, action) => {
            state.allCourse = action.payload
        },
        all_CurrentAffair: (state, action) => {
            state.allCurrentAffair = action.payload
        },
        all_content: (state, action) => {
            state.content = action.payload
        },
        all_review: (state, action) => {
            state.review = action.payload
        },
        all_version: (state, action) => {
            state.versionData = action.payload;
        },
        all_tabName: (state, action) => {
            state.tabName = action.payload;
        },
        reset_tab: (state, action) => {
            state.tabName = ''
        },
        profile_data: (state, action) => {
            state.profileDetail = action.payload
        }
    }
})

export const { 
    all_CategoryAction, 
    all_CourseAction, 
    all_CurrentAffair, 
    all_content, 
    all_review, 
    all_version, 
    all_tabName, 
    reset_tab,
    profile_data
} = masterContentSlice.actions
export default masterContentSlice.reducer;