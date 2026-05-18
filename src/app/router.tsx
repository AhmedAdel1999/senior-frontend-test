import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotificationContainer } from "@/components/ui/NotificationContainer";
import { Spinner } from "@/components/ui";

// Code Splitting

const TaskListPage = lazy(() =>
  import("@/pages/TaskListPage").then((m) => ({ default: m.TaskListPage })),
);
const TaskDetailPage = lazy(() =>
  import("@/pages/TaskDetailPage").then((m) => ({ default: m.TaskDetailPage })),
);
const CreateTaskPage = lazy(() =>
  import("@/pages/CreateTaskPage").then((m) => ({ default: m.CreateTaskPage })),
);

function PageLoader() {
  return (
    <div className="page-center">
      <Spinner size="lg" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<TaskListPage />} />
            <Route path="/tasks/new" element={<CreateTaskPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
      <NotificationContainer />
    </BrowserRouter>
  );
}
