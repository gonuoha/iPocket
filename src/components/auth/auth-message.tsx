import { cn } from "@/lib/utils";

type AuthMessageProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthInfoMessage({ children, className }: AuthMessageProps) {
  return (
    <p
      className={cn(
        "rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function AuthErrorMessage({ children, className }: AuthMessageProps) {
  return (
    <p
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className,
      )}
    >
      {children}
    </p>
  );
}
