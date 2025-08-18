"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

interface SidebarContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hasInitialized = useRef(false);
  const isInitializing = useRef(true);
  const lastSavedState = useRef<string | null>(null);

  // Initialize from localStorage only once
  useEffect(() => {
    if (typeof window !== "undefined" && !hasInitialized.current) {
      try {
        const savedState = localStorage.getItem("sidebarCollapsed");
        if (savedState !== null) {
          const parsedState = JSON.parse(savedState);
          setSidebarCollapsed(parsedState);
        }
      } catch (error) {
        console.error("Error loading sidebar state from localStorage:", error);
      }
      hasInitialized.current = true;
      isInitializing.current = false;
    }
  }, []);

  // Save to localStorage only after initialization and when state changes
  useEffect(() => {
    if (
      hasInitialized.current &&
      !isInitializing.current &&
      typeof window !== "undefined"
    ) {
      const newState = JSON.stringify(sidebarCollapsed);
      if (lastSavedState.current !== newState) {
        localStorage.setItem("sidebarCollapsed", newState);
        lastSavedState.current = newState;

        // Dispatch custom event for other components to listen to
        window.dispatchEvent(
          new CustomEvent("sidebarStateChanged", {
            detail: { collapsed: sidebarCollapsed },
          })
        );
      }
    }
  }, [sidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const setSidebarCollapsedState = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const value = {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed: setSidebarCollapsedState,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarState must be used within a SidebarProvider");
  }
  return context;
}
