"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getNotificaciones, marcarNotificacionLeida, marcarTodasLeidas, NotificacionDoc, getInventario } from "@/lib/firestore";
import { syncNotificaciones } from "@/lib/notifications";
import { useNotif } from "@/context/NotifContext";

type NotifTipo = "urgente" | "aviso" | "info" | "ia" | "sistema";

const tipoBadge: Record<NotifTipo, { label:string; bg:string; text:string }> = {
  urgente: { label:"Urgente",  bg:"bg-red/10",    text:"text-red"       },
  aviso:   { label:"Aviso",    bg:"bg-orange/10", text:"text-orange"    },
  info:    { label:"Info",     bg:"bg-gray-100",  text:"text-gray-600"  },
  ia:      { label:"IA",       bg:"bg-purple-100",text:"text-purple-700"},
  sistema: { label:"Sistema",  bg:"bg-gray-100",  text:"text-gray-600"  },
};

const dotColor: Record<NotifTipo, string> = {
  urgente:"bg-red", aviso:"bg-orange", info:"bg-green-light", ia:"bg-purple-500", sistema:"bg-gray-300"
};

export default function NotificacionesPage() {
  const { user } = useAuth();
  const { refresh: refreshBadge } = useNotif();
  const [notifs, setNotifs]   = useState<NotificacionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // 1. Sync notifications from inventory
      setSyncing(true);
      const inventario = await getInventario(user.uid);
      await syncNotificaciones(user.uid, inventario);
      setSyncing(false);

      // 2. Load all notifications
      const data = await getNotificaciones(user.uid);
      setNotifs(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const unread = notifs.filter(n => !n.leida).length;

  const markAll = async () => {
    if (!user) return;
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    await marcarTodasLeidas(user.uid);
    refreshBadge();
  };

  const markOne = async (notif: NotificacionDoc) => {
    if (!user || !notif.id || notif.leida) return;
    setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, leida: true } : n));
    await marcarNotificacionLeida(user.uid, notif.id);
    refreshBadge();
  };

  const urgentes    = notifs.filter(n => n.tipo === "urgente");
  const avisos      = notifs.filter(n => n.tipo === "aviso" || n.tipo === "ia");
  const informacion = notifs.filter(n => n.tipo === "info"  || n.tipo === "sistema");

  if (loading || syncing) return <LoadingState />;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Notificaciones</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400">Basadas en tu inventario actual</p>
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

      {notifs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-5xl block mb-3">🔔</span>
          <p className="text-sm font-medium">Todo en orden</p>
          <p className="text-xs mt-1">No hay alertas en tu inventario</p>
        </div>
      ) : (
        <div className="max-w-2xl space-y-4">
          <NotifSection titulo="🔴 Urgentes"    items={urgentes}    onMark={markOne} />
          <NotifSection titulo="🟡 Avisos"      items={avisos}      onMark={markOne} />
          <NotifSection titulo="🟢 Información" items={informacion} onMark={markOne} />
        </div>
      )}
    </div>
  );
}

function NotifSection({ titulo, items, onMark }: {
  titulo: string;
  items: NotificacionDoc[];
  onMark: (n: NotificacionDoc) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{titulo}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map(n => {
          const badge = tipoBadge[n.tipo as NotifTipo];
          return (
            <div key={n.id}
              className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${n.leida ? "opacity-60" : ""}`}
              onClick={() => onMark(n)}>
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotColor[n.tipo as NotifTipo]}`} />
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
              {!n.leida && <span className="w-2 h-2 rounded-full bg-green-dark flex-shrink-0 mt-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded w-64 mb-8 animate-pulse" />
      <div className="bg-white rounded-[16px] p-4 mb-2 text-center text-sm text-gray-400 animate-pulse">
        Analizando tu inventario…
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-[16px] h-32 mb-4 animate-pulse" />
      ))}
    </div>
  );
}
