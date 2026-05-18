import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { Task, TaskStatus, Role } from "@/types";

export function isTaskVisibleForRole(
  task: Task,
  role: Role,
  userId: string,
): boolean {
  switch (role) {
    case "USER":
      return task.createdBy === userId;
    case "REVIEWER":
      return ["SUBMITTED", "REVIEWED", "REJECTED"].includes(task.status);
    case "ADMIN":
      return ["REVIEWED", "APPROVED", "REJECTED"].includes(task.status);
    default:
      return false;
  }
}

export const selectFilters = (state: RootState) => state.ui.filters;
export const selectActiveRole = (state: RootState) => state.role.activeRole;
export const selectActiveUserId = (state: RootState) => state.role.activeUserId;
export const selectNotifications = (state: RootState) => state.ui.notifications;

const PAGE_SIZE = 8;

export const makeSelectFilteredTasks = (tasks: Task[]) =>
  createSelector(
    selectActiveRole,
    selectActiveUserId,
    selectFilters,
    (role, userId, filters) => {
      return tasks
        .filter((task) => isTaskVisibleForRole(task, role, userId))
        .filter((task) => {
          if (filters.statuses.length === 0) return true;
          return filters.statuses.includes(task.status as TaskStatus);
        })
        .filter((task) => {
          if (!filters.search.trim()) return true;
          return task.title
            .toLowerCase()
            .includes(filters.search.toLowerCase());
        });
    },
  );

export const makeSelectPaginatedTasks = (filteredTasks: Task[]) =>
  createSelector(selectFilters, (filters) => {
    const totalCount = filteredTasks.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const page = Math.min(filters.page, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const items = filteredTasks.slice(start, start + PAGE_SIZE);
    return { items, totalCount, totalPages, page };
  });
