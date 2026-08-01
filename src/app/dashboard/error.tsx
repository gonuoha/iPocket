"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDemoUserMissing =
    error.name === "DemoUserNotFoundError" ||
    error.message.includes("Demo user not found");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">
        {isDemoUserMissing ? "Database setup required" : "Something went wrong"}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {isDemoUserMissing
          ? "The demo user was not found. Seed the database to load dashboard data."
          : "An unexpected error occurred while loading the dashboard."}
      </p>
      {isDemoUserMissing ? (
        <p className="font-mono text-sm text-muted-foreground">
          npm run db:seed
        </p>
      ) : null}
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
