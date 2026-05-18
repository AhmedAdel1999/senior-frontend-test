import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/types";

const STORAGE_KEY = "activeRole";

function loadRoleFromStorage(): Role {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "USER" || stored === "REVIEWER" || stored === "ADMIN") {
    return stored;
  }
  return "USER";
}

interface RoleState {
  activeRole: Role;
  activeUserId: string;
}

const ROLE_TO_USER_ID: Record<Role, string> = {
  USER: "1",
  REVIEWER: "2",
  ADMIN: "3",
};

const initialRole = loadRoleFromStorage();

const initialState: RoleState = {
  activeRole: initialRole,
  activeUserId: ROLE_TO_USER_ID[initialRole],
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    setActiveRole(state, action: PayloadAction<Role>) {
      state.activeRole = action.payload;
      state.activeUserId = ROLE_TO_USER_ID[action.payload];
      localStorage.setItem(STORAGE_KEY, action.payload);
    },
  },
});

export const { setActiveRole } = roleSlice.actions;
export default roleSlice.reducer;
