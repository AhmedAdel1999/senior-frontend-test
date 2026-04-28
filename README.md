# Senior Frontend Developer Coding Test

Welcome to the coding test for the **Senior Frontend Developer** role.

This test evaluates how you architect, scale, and reason about a real-world frontend application — not just whether you can make it work.

---

## ⏳ Time Limit

You have **3 days** to complete this test.

---

## 📤 Submission Steps

1. Fork this repository
2. Complete the implementation
3. Push your solution to your fork
4. Email your GitHub repository link to: [careers@fekracorp.com](mailto:careers@fekracorp.com)

> ⚠️ Your **README is as important as your code.** We will read it carefully. Missing or shallow documentation will disqualify a submission.

---

## 📁 Repository Structure

```
role-based-task-system/
│
└── README.md
```

---

## 🧠 Core Idea (VERY IMPORTANT)

You are building a **role-based task workflow system**.

We are NOT testing UI complexity or pixel-perfect design.

We ARE testing:

- **Frontend architecture** — how you structure and scale a React application
- **Role-based state management** — how access control flows through your app
- **Data layer design** — RTK Query, caching, and consistency
- **Async handling** — race conditions, optimistic updates, error states
- **Engineering reasoning** — your written explanation of every decision

---

## 👥 Roles

Implement **role switching in the UI — no authentication required**.

| Role | Permissions |
|---|---|
| **USER** | Create tasks, edit own draft tasks, submit tasks for review |
| **REVIEWER** | View submitted tasks, accept or reject, forward to Admin |
| **ADMIN** | View all tasks, give final approval or rejection |

---

## 🔄 Task Flow

```
USER creates task (DRAFT)
        ↓
USER submits task (SUBMITTED)
        ↓
REVIEWER accepts → (REVIEWED) or rejects → (REJECTED)
        ↓
ADMIN approves → (APPROVED) or rejects → (REJECTED)
```

**Edge cases you must handle:**

- A REVIEWER rejects after the ADMIN has already approved (stale state)
- A USER edits a task that is simultaneously being reviewed (optimistic update conflict)
- A task is deleted while another user is viewing it
- API failure mid-flow (e.g. status update fails after local state already changed)

---

## 📌 Task Model

```ts
Task {
  id: string
  title: string
  description: string
  status: "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED"
  createdBy: string           // user id
  assignedToRole: "USER" | "REVIEWER" | "ADMIN"
  createdAt: string           // ISO date string
  updatedAt?: string          // must be maintained on every mutation
  rejectionReason?: string    // required when status is REJECTED
}
```

---

## 🌐 API

### Setup JSON Server

```bash
npm install -g json-server
json-server --watch db.json --port 4000
```

### Base URL

```
http://localhost:4000
```

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Fetch all tasks |
| GET | `/tasks/:id` | Fetch single task |
| POST | `/tasks` | Create a task |
| PATCH | `/tasks/:id` | Partial update a task |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/users` | Fetch all users |

---

## 📦 Sample db.json

```json
{
  "users": [
    { "id": "1", "name": "User A", "role": "USER" },
    { "id": "2", "name": "Reviewer B", "role": "REVIEWER" },
    { "id": "3", "name": "Admin C", "role": "ADMIN" }
  ],
  "tasks": [
    {
      "id": "t1",
      "title": "Fix login bug",
      "description": "Login fails randomly on mobile",
      "status": "SUBMITTED",
      "createdBy": "1",
      "assignedToRole": "REVIEWER",
      "createdAt": "2026-04-28",
      "updatedAt": "2026-04-28"
    }
  ]
}
```

---

## 🔁 Core Features

### 1. Role Switching

- Switch active role from the UI (dropdown or tab)
- No auth system required
- UI must update **instantly and completely** on role change
- Active role must persist across page refresh (use localStorage or URL param — explain your choice)

---

### 2. Task List Page

- Display tasks **filtered by the active role's visibility rules**
- Filter by status (multi-select)
- Search by title (debounced — explain your debounce strategy)
- Loading, empty, and error states for every data fetch
- Pagination or infinite scroll (choose one — justify it in the README)

---

### 3. Task Detail Page

**USER view:**
- Edit title and description (draft tasks only)
- Submit task for review
- Delete own draft task
- Cannot edit or delete after submission

**REVIEWER view:**
- Read-only task details
- Accept task → moves to REVIEWED, forwards to ADMIN
- Reject task → requires a rejection reason (validated field)

**ADMIN view:**
- Read-only task details + full history
- Final approve → status becomes APPROVED
- Final reject → requires a rejection reason

---

### 4. Optimistic Updates

- Status changes (submit, accept, reject, approve) must be **optimistic** — UI updates immediately, rolls back on API failure
- Show a clear rollback notification when a failure occurs
- Handle race conditions: if two mutations fire in quick succession, only the last one should win

---

### 5. Error Handling

- All API errors must be caught and surfaced to the user (no silent failures)
- Network failure during a mutation must restore previous state
- 404 on task detail page must redirect with a user-friendly message
- Form validation errors must be inline (not alerts)

---

## ⚙️ Technical Requirements

### 1. Stack

You must use:

- **React** (functional components, hooks only)
- **Redux Toolkit** with **RTK Query**
- **TypeScript** (strict mode — no `any`)
- **React Router v6**

You may choose your own UI library or use plain CSS. Justify your choice.

---

### 2. State Management

Clearly separate:

| State Type | Where it lives | Why |
|---|---|---|
| Server state | RTK Query cache | |
| Global UI state | Redux slice | |
| Local component state | useState / useReducer | |

You will be asked to explain any state that ends up in the wrong layer.

---

### 3. RTK Query — You MUST implement and explain:

- **Cache invalidation strategy**: when and why you invalidate tags
- **Optimistic updates**: using `onQueryStarted` with rollback on failure
- **Polling or manual refetch**: where you chose polling and why (or why not)


---

### 4. Architecture

We expect a scalable folder structure with clear separation between UI, logic, and data layers. Your structure must be explained and justified in the README — we want to see how you think about it, not follow a template.

Deviations from common patterns are acceptable — but must be explained in the README.

---

### 5. Form Validation

You must implement form validation in a **scalable, reusable way** — not inline ad-hoc checks per component.

We expect:

- A single validation schema layer shared across forms (use **Zod** or **Yup** — justify your choice)
- Schema-driven validation tied to your TypeScript types — no duplicated type definitions
- A custom hook (e.g. `useForm` with **React Hook Form**) that any form in the app consumes consistently
- Field-level errors shown inline, not via alerts or toasts
- Validation runs on submit AND on blur (explain why both matter)
- Error messages are user-facing strings defined in the schema, not scattered in components

**Forms in scope:**

| Form | Required fields | Special rules |
|---|---|---|
| Create / Edit Task | title, description | Title min 5 chars, description min 10 chars |
| Rejection Reason | reason | Required, min 20 chars, only shown when rejecting |

You will be asked in the README to explain how you would add a new form to this system without touching existing validation logic.

---

### 6. Performance

You must demonstrate at least **two** of the following:

- Memoization of expensive selectors (`createSelector`)
- Component memoization where it genuinely helps (explain where it doesn't)
- Code splitting by route
- Debounced search to avoid excessive API calls
- Avoiding unnecessary re-renders (profiler screenshot or explanation)

---

## 📝 README Requirements

Your README must cover all of the following. Shallow answers will be flagged.

### Architecture
- Folder structure rationale
- How features are separated and why

### Role Handling
- How the active role is stored
- How role-based rendering is enforced (guards, hooks, conditional rendering?)
- What prevents a USER from calling a REVIEWER-only API action

### State Management
- What lives in RTK Query cache vs Redux slice vs local state
- How you decided where each piece of state belongs

### RTK Query
- Your tag-based cache invalidation strategy with examples
- Where you used optimistic updates and how rollback works
- How you handled stale data

### Form Validation
- Which validation library you chose and why
- How schemas map to TypeScript types (no duplication)
- How a new developer would add a new form without touching existing validation logic
- How you handle server-side validation errors (e.g. API returns a 400) and surface them in the form

### Trade-offs
- What you would do differently with more time
- Any shortcuts taken and the production-ready alternative
- Any performance trade-offs made

---

## 🚫 Disqualifiers

Submissions will not be reviewed if:

- TypeScript strict mode is disabled or bypassed with `any`
- README is missing or has fewer than 300 words
- The optimistic update + rollback flow is not implemented
- The app crashes on API failure

---

## 📤 Submission Reminder

You have **2 days**.

**Fork → Build → Document → Submit**

Send your GitHub link to: [careers@fekracorp.com](mailto:careers@fekracorp.com)

Good Luck!
