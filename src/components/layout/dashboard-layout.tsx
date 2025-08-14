"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";
import {
  BookOpen,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { RoleDisplay } from "@/components/ui/role-display";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const { can, userRole } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      current: true,
    },
    {
      name: "Bibliography",
      href: "/bibliography",
      icon: BookOpen,
      current: false,
    },
    // Only show user management for super admins
    ...(can.manageUsers
      ? [
          {
            name: "User Management",
            href: "/admin/users",
            icon: Users,
            current: false,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
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
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">
              Bibliography App
            </h1>
          </div>

          <nav className="mt-5 flex-1 px-2">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
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

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
