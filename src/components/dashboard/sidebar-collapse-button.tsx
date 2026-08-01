"use client";

import { ChevronsLeft, PanelLeftClose } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSidebar } from "./sidebar-context";

export function SidebarCollapseButton() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleSidebar}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="hidden shrink-0 md:inline-flex"
    >
      {collapsed ? (
        <ChevronsLeft className="rotate-180" />
      ) : (
        <PanelLeftClose className="size-4" />
      )}
    </Button>
  );
}
