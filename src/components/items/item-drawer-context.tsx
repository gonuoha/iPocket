"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ItemDrawerContextValue = {
  selectedItemId: string | null;
  openItem: (itemId: string) => void;
  closeItem: () => void;
};

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const openItem = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
  }, []);

  const closeItem = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedItemId,
      openItem,
      closeItem,
    }),
    [selectedItemId, openItem, closeItem],
  );

  return (
    <ItemDrawerContext.Provider value={value}>{children}</ItemDrawerContext.Provider>
  );
}

export function useItemDrawer() {
  const context = useContext(ItemDrawerContext);

  if (!context) {
    throw new Error("useItemDrawer must be used within ItemDrawerProvider");
  }

  return context;
}
