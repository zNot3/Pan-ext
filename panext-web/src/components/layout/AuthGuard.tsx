"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl animate-bounce">🌿</span>
          <p className="text-gray-400 text-sm font-medium">Cargando Pan-Ext…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
