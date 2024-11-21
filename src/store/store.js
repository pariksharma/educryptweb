import { configureStore, combineReducers } from "@reduxjs/toolkit";
import appDetailReducer from "./sliceContainer/appDetailSlice";
import masterContentReducer from "./sliceContainer/masterContentSlice";

const combinereducer = combineReducers({
    appDetail: appDetailReducer,
    allCategory: masterContentReducer
})

const rootReducer = (state, action) => {
    if(action.type == 'logout/logoutAction'){
        state = {}
    }
    return combinereducer(state, action)
}

export const store = configureStore({
    reducer: rootReducer,
})


export const persistor = store;

