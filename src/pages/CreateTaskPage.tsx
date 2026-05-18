import { useNavigate } from "react-router-dom";
import { useCreateTaskMutation } from "@/lib/api/tasksApi";
import { useAppSelector } from "@/app/hooks";
import { useAppForm } from "@/hooks/useAppForm";
import { useNotification } from "@/hooks/useNotification";
import { taskFormSchema } from "@/lib/validation/schemas";
import type { TaskFormValues } from "@/lib/validation/schemas";
import { Button, FormField } from "@/components/ui";

export function CreateTaskPage() {
  const navigate = useNavigate();
  const notify = useNotification();
  const activeUserId = useAppSelector((s) => s.role.activeUserId);
  const activeRole = useAppSelector((s) => s.role.activeRole);

  const [createTask, { isLoading }] = useCreateTaskMutation();

  const form = useAppForm<TaskFormValues>(taskFormSchema, {
    title: "",
    description: "",
  });

  if (activeRole !== "USER") {
    return (
      <div className="page-center">
        <div className="not-found">
          <h2 className="not-found-title">Access Denied</h2>
          <p className="not-found-desc">Only Users can create tasks.</p>
          <Button variant="secondary" onClick={() => navigate("/")}>
            ← Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = form.handleSubmit(async (values: TaskFormValues) => {
    try {
      const task = await createTask({
        ...values,
        createdBy: activeUserId,
      }).unwrap();
      notify.success("Task created successfully.");
      navigate(`/tasks/${task.id}`);
    } catch (err) {
      notify.error("Failed to create task. Please try again.");
    }
  });

  return (
    <div className="create-task-page animate-fade-in">
      <button className="back-link" onClick={() => navigate("/")}>
        ← Back to Tasks
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <h1 className="page-title">New Task</h1>
          <p className="page-subtitle">
            Create a new task. It starts as a draft.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Title"
            error={form.formState.errors.title?.message}
            required
            hint="5–120 characters"
          >
            <input
              {...form.register("title")}
              className={`form-input ${form.formState.errors.title ? "input-error" : ""}`}
              placeholder="What needs to be done?"
              autoFocus
            />
          </FormField>

          <FormField
            label="Description"
            error={form.formState.errors.description?.message}
            required
            hint="10–2000 characters — be specific"
          >
            <textarea
              {...form.register("description")}
              className={`form-textarea ${form.formState.errors.description ? "input-error" : ""}`}
              rows={6}
              placeholder="Describe the task in detail..."
            />
          </FormField>

          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
