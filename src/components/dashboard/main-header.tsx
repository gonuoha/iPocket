"use client";

import {
  ArrowUpDown,
  LayoutGrid,
  List,
  PanelLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSidebar } from "./sidebar-context";

type MainHeaderProps = {
  title: string;
};

export function MainHeader({ title }: MainHeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="shrink-0 md:hidden"
        >
          <PanelLeft />
        </Button>
        <h1 className="truncate text-xl font-semibold md:text-2xl">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Grid view" disabled>
          <LayoutGrid />
        </Button>
        <Button variant="ghost" size="icon" aria-label="List view" disabled>
          <List />
        </Button>
        <Button variant="outline" size="sm" disabled className="ml-1">
          <ArrowUpDown />
          Sort
        </Button>
      </div>
    </header>
  );
}
