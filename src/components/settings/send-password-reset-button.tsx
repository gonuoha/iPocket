"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SendPasswordResetButtonProps = {
  email: string;
  className?: string;
};

export function SendPasswordResetButton({
  email,
  className,
}: SendPasswordResetButtonProps) {
  const [isSending, setIsSending] = useState(false);

  async function handleSendResetLink() {
    setIsSending(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (response.status === 429) {
        toast.error(data.error ?? "Too many attempts. Please try again later.");
        return;
      }

      if (!response.ok) {
        toast.error(data.error ?? "Unable to send reset email. Please try again.");
        return;
      }

      toast.success(
        data.message ??
          "If an account with that email exists, we've sent password reset instructions.",
      );
    } catch {
      toast.error("Unable to send reset email. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(className)}
      onClick={() => void handleSendResetLink()}
      disabled={isSending}
    >
      <Mail className="size-4" />
      {isSending ? "Sending..." : "Forgot Password"}
    </Button>
  );
}
