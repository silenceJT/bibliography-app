import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import PersistentSidebar from "@/components/layout/persistent-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bibliography Database",
  description: "Modern bibliography management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <SessionProvider>
          <SidebarProvider>
            <div className="min-h-screen bg-background">
              <PersistentSidebar />
              {children}
            </div>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
