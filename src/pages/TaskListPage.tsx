import { memo, useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetTasksQuery } from "@/lib/api/tasksApi";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  setSearch,
  toggleStatusFilter,
  clearFilters,
  setPage,
} from "@/features/tasks/uiSlice";
import {
  makeSelectFilteredTasks,
  makeSelectPaginatedTasks,
} from "@/features/tasks/selectors";
import { useDebounce } from "@/hooks/useDebounce";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Spinner,
} from "@/components/ui";
import type { Task, TaskStatus } from "@/types";

const ALL_STATUSES: TaskStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "REVIEWED",
  "APPROVED",
  "REJECTED",
];

const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: TaskStatus;
}) {
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
      {status}
    </Badge>
  );
});

const TaskCard = memo(function TaskCard({ task }: { task: Task }) {
  return (
    <Link to={`/tasks/${task.id}`} className="task-card animate-fade-in">
      <div className="task-card-header">
        <StatusBadge status={task.status} />
        <span className="task-card-date">
          {new Date(task.updatedAt).toLocaleDateString()}
        </span>
      </div>
      <h3 className="task-card-title">{task.title}</h3>
      <p className="task-card-desc">{task.description}</p>
      <div className="task-card-footer">
        <span className="task-card-role">→ {task.assignedToRole}</span>
        <span className="task-card-arrow">↗</span>
      </div>
    </Link>
  );
});

const FiltersBar = memo(function FiltersBar() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.ui.filters);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useMemo(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setLocalSearch(e.target.value),
    [],
  );

  return (
    <div className="filters-bar">
      <div className="search-wrapper">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search tasks..."
          value={localSearch}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search tasks"
        />
        {localSearch && (
          <button
            className="search-clear"
            onClick={() => {
              setLocalSearch("");
              dispatch(setSearch(""));
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <div className="status-filters">
        {ALL_STATUSES.map((status) => (
          <button
            key={status}
            className={`status-filter-btn status-filter-${status.toLowerCase()} ${filters.statuses.includes(status) ? "status-filter-active" : ""}`}
            onClick={() => dispatch(toggleStatusFilter(status))}
            aria-pressed={filters.statuses.includes(status)}
          >
            {status}
          </button>
        ))}
      </div>
      {(localSearch || filters.statuses.length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalSearch("");
            dispatch(clearFilters());
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );
});

const Pagination = memo(function Pagination({
  page,
  totalPages,
  totalCount,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
}) {
  const dispatch = useAppDispatch();
  return (
    <div className="pagination">
      <span className="pagination-info">
        {totalCount} task{totalCount !== 1 ? "s" : ""}
      </span>
      <div className="pagination-controls">
        <Button
          variant="ghost"
          size="sm"
          disabled={page === 1}
          onClick={() => dispatch(setPage(page - 1))}
        >
          ← Prev
        </Button>
        <span className="pagination-pages">
          {page} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page === totalPages}
          onClick={() => dispatch(setPage(page + 1))}
        >
          Next →
        </Button>
      </div>
    </div>
  );
});

export function TaskListPage() {
  const navigate = useNavigate();
  const { canCreate, activeRole } = useRoleGuard();
  const {
    data: allTasks = [],
    isLoading,
    isError,
    refetch,
  } = useGetTasksQuery();

  const selectFiltered = useMemo(
    () => makeSelectFilteredTasks(allTasks),
    [allTasks],
  );
  const filteredTasks = useAppSelector(selectFiltered);
  const selectPaginated = useMemo(
    () => makeSelectPaginatedTasks(filteredTasks),
    [filteredTasks],
  );
  const { items, totalCount, totalPages, page } =
    useAppSelector(selectPaginated);

  const PAGE_TITLES: Record<string, string> = {
    USER: "My Tasks",
    REVIEWER: "Review Queue",
    ADMIN: "Admin Dashboard",
  };
  const PAGE_SUBTITLES: Record<string, string> = {
    USER: "Manage and track your work items",
    REVIEWER: "Tasks awaiting your review",
    ADMIN: "Final approval and oversight",
  };

  if (isLoading) {
    return (
      <div className="page-center">
        <Spinner size="lg" />
        <p className="loading-text">Loading tasks...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-center">
        <ErrorMessage
          message="Failed to load tasks. Is the JSON server running on port 4000?"
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="task-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{PAGE_TITLES[activeRole]}</h1>
          <p className="page-subtitle">{PAGE_SUBTITLES[activeRole]}</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => navigate("/tasks/new")}>
            + New Task
          </Button>
        )}
      </div>
      <FiltersBar />
      {items.length === 0 ? (
        <EmptyState
          icon="◻"
          title="No tasks found"
          description={
            totalCount === 0
              ? "No tasks visible for your role yet."
              : "No tasks match your current filters."
          }
          action={
            canCreate ? (
              <Button variant="primary" onClick={() => navigate("/tasks/new")}>
                Create your first task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="task-grid">
            {items.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
            />
          )}
        </>
      )}
    </div>
  );
}
