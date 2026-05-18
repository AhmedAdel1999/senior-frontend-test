import { useAppSelector } from "@/app/hooks";
import {
  selectActiveRole,
  selectActiveUserId,
} from "@/features/tasks/selectors";
import { isTaskVisibleForRole } from "@/features/tasks/selectors";
import type { Role, Task } from "@/types";

export function useRoleGuard() {
  const activeRole = useAppSelector(selectActiveRole);
  const activeUserId = useAppSelector(selectActiveUserId);

  return {
    activeRole,
    activeUserId,

    canCreate: activeRole === "USER",

    canEdit: (task: Task) =>
      activeRole === "USER" &&
      task.createdBy === activeUserId &&
      task.status === "DRAFT",

    canDelete: (task: Task) =>
      activeRole === "USER" &&
      task.createdBy === activeUserId &&
      task.status === "DRAFT",

    canSubmit: (task: Task) =>
      activeRole === "USER" &&
      task.createdBy === activeUserId &&
      task.status === "DRAFT",

    canReview: (task: Task) =>
      activeRole === "REVIEWER" && task.status === "SUBMITTED",

    canApprove: (task: Task) =>
      activeRole === "ADMIN" && task.status === "REVIEWED",

    canView: (task: Task) =>
      isTaskVisibleForRole(task, activeRole, activeUserId),

    is: (role: Role) => activeRole === role,
  };
}
