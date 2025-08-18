"use client";

import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePermissions } from "@/hooks/use-permissions";
import { useSidebarState } from "@/contexts/sidebar-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RoleDisplay } from "@/components/ui/role-display";

export default function PersistentSidebar() {
  const { data: session } = useSession();
  const { can, userRole } = usePermissions();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed, toggleSidebar } = useSidebarState();

  const navigation = useMemo(
    () => [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: BarChart3,
        current: pathname === "/dashboard",
      },
      {
        name: "Bibliography",
        href: "/bibliography",
        icon: BookOpen,
        current: pathname === "/bibliography",
      },
      // Only show user management for super admins
      ...(can.manageUsers
        ? [
            {
              name: "User Management",
              href: "/admin/users",
              icon: Users,
              current: pathname === "/admin/users",
            },
          ]
        : []),
    ],
    [pathname, can.manageUsers]
  );

  const handleNavigation = () => {
    // Close mobile sidebar when navigating
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-50">
          {sidebarOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          )}

          <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-900">
                Bibliography App
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                      item.current
                        ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={handleNavigation}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${
                        item.current
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* User info and logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <RoleDisplay role={userRole} className="mb-3" />
              <div className="text-sm text-gray-600 mb-2">
                {session?.user?.email}
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 sidebar-transition z-50 ${
          sidebarCollapsed
            ? "sidebar-width-collapsed"
            : "sidebar-width-expanded"
        }`}
      >
        <div
          className={`flex flex-col flex-grow bg-white shadow-lg ${
            sidebarCollapsed ? "border-r border-gray-200" : ""
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-semibold text-gray-900">
                Bibliography App
              </h1>
            )}
            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative group"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300 pointer-events-none whitespace-nowrap z-[9999]">
                  Expand sidebar
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              )}
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          <nav className="mt-5 flex-1 px-2">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors relative ${
                    item.current
                      ? sidebarCollapsed
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <div className="relative">
                    <item.icon
                      className={`${
                        item.current
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      } ${sidebarCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5"}`}
                    />
                    {sidebarCollapsed && (
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300 pointer-events-none whitespace-nowrap z-[9999]">
                        {item.name}
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && item.name}
                  {sidebarCollapsed && item.current && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full shadow-sm"></div>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            {!sidebarCollapsed && (
              <>
                <RoleDisplay role={userRole} className="mb-3" />
                <div className="text-sm text-gray-600 mb-2 truncate">
                  {session?.user?.email}
                </div>
              </>
            )}
            <button
              onClick={() => signOut()}
              className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors relative group ${
                sidebarCollapsed ? "w-full" : "w-full"
              }`}
              title={sidebarCollapsed ? "Sign out" : undefined}
            >
              {sidebarCollapsed && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300 pointer-events-none whitespace-nowrap z-[9999]">
                  Sign out
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              )}
              <LogOut
                className={`text-gray-400 ${
                  sidebarCollapsed ? "h-5 w-5" : "mr-2 h-4 w-4"
                }`}
              />
              {!sidebarCollapsed && "Sign out"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center h-16 bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="px-4 text-gray-500 hover:text-gray-600"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-semibold text-gray-900">
          Bibliography App
        </h1>
      </div>
    </>
  );
}
