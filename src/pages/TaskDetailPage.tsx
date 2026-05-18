import { memo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/api/tasksApi";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAppForm } from "@/hooks/useAppForm";
import { useNotification } from "@/hooks/useNotification";
import { taskFormSchema, rejectionSchema } from "@/lib/validation/schemas";
import type {
  TaskFormValues,
  RejectionFormValues,
} from "@/lib/validation/schemas";
import {
  Button,
  Badge,
  FormField,
  Spinner,
  ErrorMessage,
} from "@/components/ui";
import type { Task, TaskStatus } from "@/types";

const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: TaskStatus;
}) {
  const labels: Record<TaskStatus, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    REVIEWED: "Reviewed",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return (
    <Badge
      variant={
        status.toLowerCase() as
          | "draft"
          | "submitted"
          | "reviewed"
          | "approved"
          | "rejected"
      }
    >
      {labels[status]}
    </Badge>
  );
});

function RejectionForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const form = useAppForm<RejectionFormValues>(rejectionSchema, {
    rejectionReason: "",
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data.rejectionReason);
  });

  return (
    <div className="rejection-form animate-fade-in">
      <h4 className="rejection-form-title">Rejection Reason</h4>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Reason for rejection"
          error={form.formState.errors.rejectionReason?.message}
          required
          hint="Min 20 characters. Be specific so the author can address the issue."
        >
          <textarea
            {...form.register("rejectionReason")}
            className={`form-textarea ${form.formState.errors.rejectionReason ? "input-error" : ""}`}
            rows={4}
            placeholder="Explain why this task is being rejected..."
          />
        </FormField>
        <div className="form-actions">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="sm" loading={isLoading}>
            Confirm Rejection
          </Button>
        </div>
      </form>
    </div>
  );
}

function EditForm({
  task,
  onSave,
  onCancel,
  isLoading,
}: {
  task: Task;
  onSave: (values: TaskFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const form = useAppForm<TaskFormValues>(taskFormSchema, {
    title: task.title,
    description: task.description,
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSave)}
      className="edit-form animate-fade-in"
    >
      <FormField
        label="Title"
        error={form.formState.errors.title?.message}
        required
        hint="5–120 characters"
      >
        <input
          {...form.register("title")}
          className={`form-input ${form.formState.errors.title ? "input-error" : ""}`}
          placeholder="Task title"
        />
      </FormField>
      <FormField
        label="Description"
        error={form.formState.errors.description?.message}
        required
        hint="10–2000 characters"
      >
        <textarea
          {...form.register("description")}
          className={`form-textarea ${form.formState.errors.description ? "input-error" : ""}`}
          rows={5}
          placeholder="Describe the task in detail..."
        />
      </FormField>
      <div className="form-actions">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notify = useNotification();
  const guard = useRoleGuard();

  const [isEditing, setIsEditing] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const {
    data: task,
    isLoading,
    isError,
    error,
  } = useGetTaskByIdQuery(id!, { skip: !id });

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const is404 =
    isError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404;

  if (is404) {
    return (
      <div className="page-center">
        <div className="not-found">
          <h2 className="not-found-title">Task Not Found</h2>
          <p className="not-found-desc">
            This task may have been deleted or the ID is incorrect.
          </p>
          <Button variant="secondary" onClick={() => navigate("/")}>
            ← Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="page-center">
        <ErrorMessage
          message="Failed to load this task."
          onRetry={() => navigate(0)}
        />
      </div>
    );
  }

  const handleSaveEdit = async (values: TaskFormValues) => {
    try {
      await updateTask({ id: task.id, patch: values }).unwrap();
      setIsEditing(false);
      notify.success("Task updated successfully.");
    } catch {
      notify.error("Failed to save changes. Your edit has been reverted.");
    }
  };

  const handleSubmitForReview = async () => {
    try {
      await updateTask({
        id: task.id,
        patch: { status: "SUBMITTED", assignedToRole: "REVIEWER" },
      }).unwrap();
      notify.success("Task submitted for review.");
    } catch {
      notify.error("Failed to submit task. Previous status restored.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await deleteTask(task.id).unwrap();
      notify.success("Task deleted.");
      navigate("/");
    } catch {
      notify.error("Failed to delete task.");
    }
  };

  const handleReviewerAccept = async () => {
    try {
      await updateTask({
        id: task.id,
        patch: { status: "REVIEWED", assignedToRole: "ADMIN" },
      }).unwrap();
      notify.success("Task accepted and forwarded to Admin.");
    } catch {
      notify.error("Failed to accept task. Status reverted.");
    }
  };

  const handleReviewerReject = async (reason: string) => {
    try {
      await updateTask({
        id: task.id,
        patch: {
          status: "REJECTED",
          assignedToRole: "USER",
          rejectionReason: reason,
        },
      }).unwrap();
      setShowRejectionForm(false);
      notify.success("Task rejected.");
    } catch {
      notify.error("Failed to reject task. Status reverted.");
    }
  };

  const handleAdminApprove = async () => {
    try {
      await updateTask({
        id: task.id,
        patch: { status: "APPROVED", assignedToRole: "ADMIN" },
      }).unwrap();
      notify.success("Task approved!");
    } catch {
      notify.error("Failed to approve task. Status reverted.");
    }
  };

  const handleAdminReject = async (reason: string) => {
    try {
      await updateTask({
        id: task.id,
        patch: {
          status: "REJECTED",
          assignedToRole: "USER",
          rejectionReason: reason,
        },
      }).unwrap();
      setShowRejectionForm(false);
      notify.success("Task rejected.");
    } catch {
      notify.error("Failed to reject task. Status reverted.");
    }
  };

  return (
    <div className="task-detail-page animate-fade-in">
      <button className="back-link" onClick={() => navigate("/")}>
        ← All Tasks
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-header-meta">
            <StatusBadge status={task.status} />
            <span className="detail-role-badge">→ {task.assignedToRole}</span>
          </div>
          <div className="detail-dates">
            <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
            {task.updatedAt && (
              <span>
                Updated {new Date(task.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {isEditing ? (
          <EditForm
            task={task}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            isLoading={isUpdating}
          />
        ) : (
          <div className="detail-body">
            <h1 className="detail-title">{task.title}</h1>
            <p className="detail-description">{task.description}</p>

            {task.rejectionReason && (
              <div className="rejection-notice">
                <span className="rejection-notice-label">
                  Rejection reason:
                </span>
                <p>{task.rejectionReason}</p>
              </div>
            )}
          </div>
        )}

        {!isEditing && !showRejectionForm && (
          <div className="detail-actions">
            {guard.canEdit(task) && (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
            {guard.canSubmit(task) && (
              <Button
                variant="primary"
                loading={isUpdating}
                onClick={handleSubmitForReview}
              >
                Submit for Review
              </Button>
            )}
            {guard.canDelete(task) && (
              <Button
                variant="danger"
                loading={isDeleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}

            {guard.canReview(task) && (
              <>
                <Button
                  variant="success"
                  loading={isUpdating}
                  onClick={handleReviewerAccept}
                >
                  Accept → Forward to Admin
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectionForm(true)}
                >
                  Reject
                </Button>
              </>
            )}

            {guard.canApprove(task) && (
              <>
                <Button
                  variant="success"
                  loading={isUpdating}
                  onClick={handleAdminApprove}
                >
                  Final Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectionForm(true)}
                >
                  Final Reject
                </Button>
              </>
            )}
          </div>
        )}

        {showRejectionForm && (
          <RejectionForm
            onSubmit={
              guard.activeRole === "REVIEWER"
                ? handleReviewerReject
                : handleAdminReject
            }
            onCancel={() => setShowRejectionForm(false)}
            isLoading={isUpdating}
          />
        )}
      </div>
    </div>
  );
}
