"use client";
import Link from "next/link";
import { useNotif } from "@/context/NotifContext";

export default function TopBar() {
  const { unreadCount, urgentCount } = useNotif();

  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-6 z-30">
      {/* Search */}
      <div className="relative w-80">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Buscar recetas, ingredientes…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-full border border-transparent focus:border-green-mid focus:bg-white focus:outline-none transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/notificaciones"
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-lg"
          title="Notificaciones"
        >
          🔔
          {unreadCount > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 ${
              urgentCount > 0 ? "bg-red" : "bg-orange"
            }`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/perfil" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-lg" title="Ajustes">
          ⚙️
        </Link>
      </div>
    </header>
  );
}
