import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your Memex account"
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
