"use client";

import { useSidebarState } from "@/contexts/sidebar-context";
import { useEffect, useState } from "react";

interface ContentLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: ContentLayoutProps) {
  const { sidebarCollapsed } = useSidebarState();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setIsTransitioning(true);
      // Reset transition state after animation completes
      setTimeout(() => setIsTransitioning(false), 300);
    };

    window.addEventListener(
      "sidebarStateChanged",
      handleSidebarStateChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "sidebarStateChanged",
        handleSidebarStateChange as EventListener
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area with responsive padding and smooth transitions */}
      <div
        className={`sidebar-transition ${
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        } ${isTransitioning ? "transitioning" : ""}`}
        style={{
          transitionProperty: "padding-left",
          transitionDuration: "300ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Page content container with proper spacing and responsive design */}
        <main className="p-6 min-h-screen">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
