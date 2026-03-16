"use client";
import { useState } from "react";
import { notificaciones as initialNotifs, Notificacion, NotifTipo } from "@/lib/data";

const tipoBadge: Record<NotifTipo, { label:string; bg:string; text:string }> = {
  urgente: { label:"Urgente",  bg:"bg-red/10",    text:"text-red"    },
  aviso:   { label:"Aviso",    bg:"bg-orange/10", text:"text-orange" },
  info:    { label:"Info",     bg:"bg-gray-100",  text:"text-gray-600" },
  ia:      { label:"IA",       bg:"bg-purple-100",text:"text-purple-700" },
  sistema: { label:"Sistema",  bg:"bg-gray-100",  text:"text-gray-600" },
};

const dotColor: Record<NotifTipo, string> = {
  urgente:"bg-red", aviso:"bg-orange", info:"bg-green-light", ia:"bg-purple-500", sistema:"bg-gray-300"
};

export default function NotificacionesPage() {
  const [notifs, setNotifs] = useState<Notificacion[]>(initialNotifs);

  const unread = notifs.filter(n => !n.leida).length;
  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
  const markOne = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));

  const urgentes   = notifs.filter(n => n.tipo === "urgente");
  const avisos     = notifs.filter(n => n.tipo === "aviso" || n.tipo === "ia");
  const informacion= notifs.filter(n => n.tipo === "info" || n.tipo === "sistema");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Notificaciones</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400">Mantente al tanto de tu despensa</p>
            {unread > 0 && (
              <span className="text-xs font-bold bg-orange text-white px-2 py-0.5 rounded-full">
                {unread} nuevas
              </span>
            )}
          </div>
        </div>
        {unread > 0 && (
          <button onClick={markAll}
            className="text-sm border border-gray-200 text-gray-600 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
            ✓ Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="max-w-2xl space-y-4">
        <NotifSection titulo="🔴 Urgentes" items={urgentes} onMark={markOne} />
        <NotifSection titulo="🟡 Avisos" items={avisos} onMark={markOne} />
        <NotifSection titulo="🟢 Información" items={informacion} onMark={markOne} />
      </div>
    </div>
  );
}

function NotifSection({ titulo, items, onMark }: { titulo:string; items:Notificacion[]; onMark:(id:number)=>void }) {
  if (items.length === 0) return null;
  return (
    <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{titulo}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map(n => {
          const badge = tipoBadge[n.tipo];
          return (
            <div key={n.id}
              className={`flex items-start gap-3 px-5 py-4 transition-colors ${n.leida ? "opacity-60" : ""}`}
              onClick={() => !n.leida && onMark(n.id)}>
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotColor[n.tipo]} ${n.leida ? "opacity-40" : ""}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">{n.titulo}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{n.descripcion}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.tiempo}</p>
              </div>
              {!n.leida && (
                <span className="w-2 h-2 rounded-full bg-green-dark flex-shrink-0 mt-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
