import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Notification,
  NotificationType,
  TaskFilters,
  TaskStatus,
} from "@/types";

interface UiState {
  notifications: Notification[];
  filters: TaskFilters;
}

const initialState: UiState = {
  notifications: [],
  filters: {
    search: "",
    statuses: [],
    page: 1,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addNotification(
      state,
      action: PayloadAction<{
        type: NotificationType;
        message: string;
        duration?: number;
      }>,
    ) {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        type: action.payload.type,
        message: action.payload.message,
        duration: action.payload.duration ?? 4000,
      };
      state.notifications.push(notification);
    },

    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
    },

    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },

    toggleStatusFilter(state, action: PayloadAction<TaskStatus>) {
      const idx = state.filters.statuses.indexOf(action.payload);
      if (idx === -1) {
        state.filters.statuses.push(action.payload);
      } else {
        state.filters.statuses.splice(idx, 1);
      }
      state.filters.page = 1;
    },

    clearFilters(state) {
      state.filters = { search: "", statuses: [], page: 1 };
    },

    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  setSearch,
  toggleStatusFilter,
  clearFilters,
  setPage,
} = uiSlice.actions;

export default uiSlice.reducer;
