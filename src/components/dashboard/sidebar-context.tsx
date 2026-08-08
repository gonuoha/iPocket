"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";

import { useIsMobile } from "@/hooks/use-mobile";

type SidebarContextValue = {
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  setMobileOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

const COLLAPSED_MEDIA_QUERY = "(max-width: 1023px)";

function subscribeToSidebarCollapsed(callback: () => void) {
  const mediaQuery = window.matchMedia(COLLAPSED_MEDIA_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSidebarCollapsedSnapshot() {
  return window.matchMedia(COLLAPSED_MEDIA_QUERY).matches;
}

function getSidebarCollapsedServerSnapshot() {
  return true;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const viewportCollapsed = useSyncExternalStore(
    subscribeToSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  );
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const collapsed = collapsedOverride ?? viewportCollapsed;

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((open) => !open);
      return;
    }

    setCollapsedOverride(!(collapsedOverride ?? viewportCollapsed));
  };

  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileOpen, isMobile, toggleSidebar, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
