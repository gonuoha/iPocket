"use client";

import { Ellipsis } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function CollectionCardMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors",
          "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <Ellipsis className="size-4" />
        <span className="sr-only">Collection actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
