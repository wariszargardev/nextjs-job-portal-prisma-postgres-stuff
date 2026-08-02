import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["EMPLOYER", "CANDIDATE"], { error: "Pick a role" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
