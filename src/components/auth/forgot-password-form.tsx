"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthErrorMessage, AuthInfoMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidEmail } from "@/lib/validate-email";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (response.status === 429) {
        setError(data.error ?? "Too many attempts. Please try again later.");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Unable to send reset email. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsComplete(true);
    } catch {
      setError("Unable to send reset email. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="space-y-4">
        <AuthInfoMessage>
          If an account with that email exists, we&apos;ve sent password reset instructions to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </AuthInfoMessage>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <AuthErrorMessage>{error}</AuthErrorMessage> : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
