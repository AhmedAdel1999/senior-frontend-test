import { z } from "zod";

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title must be under 120 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
});

export const rejectionSchema = z.object({
  rejectionReason: z
    .string()
    .min(1, "Rejection reason is required")
    .min(20, "Rejection reason must be at least 20 characters")
    .max(500, "Rejection reason must be under 500 characters"),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type RejectionFormValues = z.infer<typeof rejectionSchema>;
