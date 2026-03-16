"use client";
import Link from "next/link";

export default function TopBar() {
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
        <Link href="/notificaciones"
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-lg"
          title="Notificaciones">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </Link>
        <Link href="/perfil" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-lg" title="Ajustes">
          ⚙️
        </Link>
      </div>
    </header>
  );
}
