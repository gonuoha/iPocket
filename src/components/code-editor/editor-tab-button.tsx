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
          ? "bg-white/10 text-zinc-100"
          : "text-zinc-400 hover:text-zinc-200",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
