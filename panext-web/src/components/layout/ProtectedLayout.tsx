"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "./AuthGuard";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const PUBLIC_ROUTES = ["/login", "/registro"];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const isPublic  = PUBLIC_ROUTES.includes(pathname);

  // Public pages (login / registro) — render without sidebar
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected pages — wrap with AuthGuard + shell
  return (
    <AuthGuard>
      <Sidebar />
      <TopBar />
      <main className="ml-56 pt-14 min-h-screen">
        {children}
      </main>
    </AuthGuard>
  );
}
