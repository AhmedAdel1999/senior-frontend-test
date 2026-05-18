import { configureStore } from "@reduxjs/toolkit";
import { tasksApi } from "@/lib/api/tasksApi";
import roleReducer from "@/features/roles/roleSlice";
import uiReducer from "@/features/tasks/uiSlice";

export const store = configureStore({
  reducer: {
    [tasksApi.reducerPath]: tasksApi.reducer,
    role: roleReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tasksApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
