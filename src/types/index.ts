export type Role = "USER" | "REVIEWER" | "ADMIN";

export type TaskStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "REVIEWED"
  | "APPROVED"
  | "REJECTED";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdBy: string;
  assignedToRole: Role;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type CreateTaskPayload = Pick<Task, "title" | "description"> & {
  createdBy: string;
};

export type UpdateTaskPayload = Partial<
  Pick<
    Task,
    | "title"
    | "description"
    | "status"
    | "assignedToRole"
    | "rejectionReason"
    | "updatedAt"
  >
>;

export interface TaskFilters {
  search: string;
  statuses: TaskStatus[];
  page: number;
}

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}
