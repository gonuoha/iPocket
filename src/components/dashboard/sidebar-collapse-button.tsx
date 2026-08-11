"use client";

import { ChevronsLeft, PanelLeftClose } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSidebar } from "./sidebar-context";

export function SidebarCollapseButton() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="hidden size-11 shrink-0 md:inline-flex md:size-8"
    >
      {collapsed ? (
        <ChevronsLeft className="rotate-180" />
      ) : (
        <PanelLeftClose className="size-4" />
      )}
    </Button>
  );
}
