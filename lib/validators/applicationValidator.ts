import { z } from "zod";

export const applySchema = z.object({
  jobId: z.string().min(1),
  coverNote: z.string().optional(),
  resumePath: z.string().optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"]),
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
