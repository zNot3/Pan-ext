"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { getInventario, getNotificaciones } from "@/lib/firestore";
import { syncNotificaciones } from "@/lib/notifications";

interface NotifContextValue {
  unreadCount:  number;
  urgentCount:  number;
  refresh:      () => Promise<void>;
  syncing:      boolean;
}

const NotifContext = createContext<NotifContextValue>({
  unreadCount: 0,
  urgentCount: 0,
  refresh:     async () => {},
  syncing:     false,
});

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [syncing, setSyncing]         = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const inventario = await getInventario(user.uid);
      await syncNotificaciones(user.uid, inventario);
      const notifs = await getNotificaciones(user.uid);
      setUnreadCount(notifs.filter(n => !n.leida).length);
      setUrgentCount(notifs.filter(n => !n.leida && n.tipo === "urgente").length);
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Sync on login and every 30 minutes while the app is open
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setUrgentCount(0);
      return;
    }

    refresh();

    intervalRef.current = setInterval(refresh, 30 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, refresh]);

  return (
    <NotifContext.Provider value={{ unreadCount, urgentCount, refresh, syncing }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotif = () => useContext(NotifContext);
