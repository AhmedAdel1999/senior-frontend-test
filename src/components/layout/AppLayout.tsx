import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setActiveRole } from "@/features/roles/roleSlice";
import type { Role } from "@/types";

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: "USER", label: "User", color: "var(--role-user)" },
  { value: "REVIEWER", label: "Reviewer", color: "var(--role-reviewer)" },
  { value: "ADMIN", label: "Admin", color: "var(--role-admin)" },
];

const ROLE_NAMES: Record<Role, string> = {
  USER: "Alice Martin",
  REVIEWER: "Bob Reviewer",
  ADMIN: "Carol Admin",
};

export const AppHeader = memo(function AppHeader() {
  const dispatch = useAppDispatch();
  const activeRole = useAppSelector((s) => s.role.activeRole);
  const location = useLocation();

  const handleRoleChange = (role: Role) => {
    dispatch(setActiveRole(role));
  };

  const currentRole = ROLES.find((r) => r.value === activeRole)!;

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="logo-mark">▲</span>
          <span className="logo-text">TaskFlow</span>
        </Link>

        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "nav-link-active" : ""}`}
          >
            Tasks
          </Link>
          {activeRole === "USER" && (
            <Link
              to="/tasks/new"
              className={`nav-link ${location.pathname === "/tasks/new" ? "nav-link-active" : ""}`}
            >
              + New Task
            </Link>
          )}
        </nav>

        <div className="role-switcher">
          <span className="role-switcher-label">Active as:</span>
          <div className="role-tabs">
            {ROLES.map((role) => (
              <button
                key={role.value}
                className={`role-tab ${activeRole === role.value ? "role-tab-active" : ""}`}
                style={
                  activeRole === role.value
                    ? ({ "--role-color": role.color } as React.CSSProperties)
                    : {}
                }
                onClick={() => handleRoleChange(role.value)}
                aria-pressed={activeRole === role.value}
              >
                {role.label}
              </button>
            ))}
          </div>
          <span className="role-user-name" style={{ color: currentRole.color }}>
            {ROLE_NAMES[activeRole]}
          </span>
        </div>
      </div>
    </header>
  );
});

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <AppHeader />
      <main className="app-main">
        <div className="app-container">{children}</div>
      </main>
    </div>
  );
}
