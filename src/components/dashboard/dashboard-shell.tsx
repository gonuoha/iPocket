"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ItemDrawer } from "@/components/items/item-drawer";
import { ItemDrawerProvider } from "@/components/items/item-drawer-context";
import { EditorPreferencesProvider } from "@/components/code-editor/editor-preferences-context";
import { CommandPalette } from "@/components/search/command-palette";
import { CommandPaletteProvider } from "@/components/search/command-palette-context";
import type { DashboardSearchData } from "@/lib/db/dashboard";
import type { SelectableCollection } from "@/lib/db/collections";
import type { EditorPreferences } from "@/lib/editor-preferences";
import { cn } from "@/lib/utils";

import { TopBar } from "./top-bar";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function DashboardShellInner({
  children,
  sidebar,
  isPro,
  collections,
  itemCount,
  collectionCount,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isPro: boolean;
  collections: SelectableCollection[];
  itemCount: number;
  collectionCount: number;
}) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <TopBar
        isPro={isPro}
        collections={collections}
        itemCount={itemCount}
        collectionCount={collectionCount}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          data-collapsed={collapsed || undefined}
          className={cn(
            "group hidden h-full min-h-0 shrink-0 flex-col border-r border-border md:flex",
            collapsed ? "w-16" : "w-64",
          )}
        >
          {sidebar}
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="flex h-svh w-[min(18rem,85vw)] max-w-none flex-col gap-0 border-r p-0 sm:max-w-none"
          >
            {sidebar}
          </SheetContent>
        </Sheet>

        <main
          id="main-content"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:px-10 md:py-6 lg:px-24"
        >
          {children}
        </main>
      </div>

      <ItemDrawer collections={collections} isPro={isPro} />
      <CommandPalette />
    </div>
  );
}

export function DashboardShell({
  children,
  sidebar,
  isPro,
  collections,
  searchData,
  editorPreferences,
  itemCount,
  collectionCount,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isPro: boolean;
  collections: SelectableCollection[];
  searchData: DashboardSearchData;
  editorPreferences: EditorPreferences;
  itemCount: number;
  collectionCount: number;
}) {
  return (
    <SidebarProvider>
      <ItemDrawerProvider>
        <EditorPreferencesProvider initialPreferences={editorPreferences}>
          <CommandPaletteProvider searchData={searchData}>
            <DashboardShellInner
              sidebar={sidebar}
              isPro={isPro}
              collections={collections}
              itemCount={itemCount}
              collectionCount={collectionCount}
            >
              {children}
            </DashboardShellInner>
          </CommandPaletteProvider>
        </EditorPreferencesProvider>
      </ItemDrawerProvider>
    </SidebarProvider>
  );
}
