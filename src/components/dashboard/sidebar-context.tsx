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
const SIDEBAR_COLLAPSED_STORAGE_KEY = "memex-sidebar-collapsed";
const SIDEBAR_COLLAPSED_CHANGE_EVENT = "memex-sidebar-collapsed-change";

function readStoredCollapsedPreference(): boolean | null {
  const stored = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;
  return null;
}

function subscribeToSidebarCollapsed(callback: () => void) {
  const mediaQuery = window.matchMedia(COLLAPSED_MEDIA_QUERY);
  mediaQuery.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_COLLAPSED_CHANGE_EVENT, callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_COLLAPSED_CHANGE_EVENT, callback);
  };
}

function getSidebarCollapsedSnapshot() {
  return readStoredCollapsedPreference() ?? window.matchMedia(COLLAPSED_MEDIA_QUERY).matches;
}

function getSidebarCollapsedServerSnapshot() {
  return true;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribeToSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((open) => !open);
      return;
    }

    const nextCollapsed = !collapsed;
    localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(nextCollapsed));
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_CHANGE_EVENT));
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
