import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="bg-brand-glow flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Pick the role that matches how you&apos;ll use the portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
