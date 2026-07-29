"use client";

import { useActionState } from "react";
import { registerAction, type RegisterActionState } from "@/lib/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const initialState: RegisterActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" required />
        {state.errors?.name && <p className="text-sm text-red-600">{state.errors.name[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.errors?.email && <p className="text-sm text-red-600">{state.errors.email[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        {state.errors?.password && (
          <p className="text-sm text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">I am a</Label>
        <Select id="role" name="role" defaultValue="CANDIDATE">
          <option value="CANDIDATE">Candidate — looking for a job</option>
          <option value="EMPLOYER">Employer — hiring for a role</option>
        </Select>
        {state.errors?.role && <p className="text-sm text-red-600">{state.errors.role[0]}</p>}
      </div>

      <Button type="submit" loading={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
