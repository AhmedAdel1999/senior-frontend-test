import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Task, User, CreateTaskPayload, UpdateTaskPayload } from "@/types";

const BASE_URL = "http://localhost:4000";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Task", "User"],

  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => "/tasks",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),

    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),

    createTask: builder.mutation<Task, CreateTaskPayload>({
      query: (payload) => ({
        url: "/tasks",
        method: "POST",
        body: {
          ...payload,
          id: `t${Date.now()}`,
          status: "DRAFT",
          assignedToRole: "USER",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTask: builder.mutation<
      Task,
      { id: string; patch: UpdateTaskPayload }
    >({
      query: ({ id, patch }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: { ...patch, updatedAt: new Date().toISOString() },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],

      async onQueryStarted(
        { id, patch },
        { dispatch, queryFulfilled, getState },
      ) {
        const patchList = dispatch(
          tasksApi.util.updateQueryData("getTasks", undefined, (draft) => {
            const task = draft.find((t) => t.id === id);
            if (task) {
              Object.assign(task, patch, {
                updatedAt: new Date().toISOString(),
              });
            }
          }),
        );

        const patchDetail = dispatch(
          tasksApi.util.updateQueryData("getTaskById", id, (draft) => {
            Object.assign(draft, patch, {
              updatedAt: new Date().toISOString(),
            });
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchDetail.undo();
        }
      },
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchList = dispatch(
          tasksApi.util.updateQueryData("getTasks", undefined, (draft) => {
            const index = draft.findIndex((t) => t.id === id);
            if (index !== -1) draft.splice(index, 1);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
        }
      },
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useGetUsersQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
