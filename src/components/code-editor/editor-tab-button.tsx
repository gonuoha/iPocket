import { cn } from "@/lib/utils";

type EditorTabButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function EditorTabButton({ active, onClick, children }: EditorTabButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
