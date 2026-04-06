"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getInventario, getCompras, getNotificaciones, InventarioDoc, CompraDoc, NotificacionDoc } from "@/lib/firestore";
import { recetas } from "@/lib/data";

export default function InicioPage() {
  const { user } = useAuth();
  const [inventario,     setInventario]     = useState<InventarioDoc[]>([]);
  const [compras,        setCompras]        = useState<CompraDoc[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionDoc[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getInventario(user.uid),
      getCompras(user.uid),
      getNotificaciones(user.uid),
    ]).then(([inv, comp, notifs]) => {
      setInventario(inv);
      setCompras(comp);
      setNotificaciones(notifs);
      setLoading(false);
    });
  }, [user]);

  const pendientes   = compras.filter(c => !c.checked).length;
  const proxExpiran  = inventario.filter(i => i.alert);
  const disponibles  = recetas.filter(r => r.disponible).slice(0, 3);
  const notifRecientes = notificaciones.slice(0, 4);

  const stats = [
    { icon:"🛒", label:"Pendientes de compra",   value: pendientes,        href:"/compras"       },
    { icon:"📦", label:"Elementos en inventario", value: inventario.length, href:"/inventario"    },
    { icon:"⚠️", label:"Próximos a expirar",      value: proxExpiran.length,href:"/inventario"    },
    { icon:"🍽️", label:"Recetas disponibles",     value: disponibles.length,href:"/recetas"       },
  ];

  const nombre = user?.displayName?.split(" ")[0] ?? "Usuario";

  if (loading) return <LoadingState />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">¡Hola, {nombre}! 👋</h1>
          <p className="text-gray-400 mt-1">Aquí está tu resumen del día</p>
        </div>
        <Link href="/compras"
          className="bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
          + Agregar a compras
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Link key={i} href={s.href}
            className="bg-white rounded-[16px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-md transition-shadow flex items-center gap-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Notificaciones recientes */}
        <div className="col-span-2 bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">⚠️ Notificaciones recientes</h2>
            <Link href="/notificaciones" className="text-xs text-green-dark font-semibold hover:underline">Ver todas →</Link>
          </div>
          {notifRecientes.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay notificaciones</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifRecientes.map(n => (
                <div key={n.id} className="flex items-start gap-3 py-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    n.tipo === "urgente" ? "bg-red" : n.tipo === "aviso" ? "bg-orange" : "bg-green-light"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{n.titulo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos a expirar */}
        <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">⚠️ Próximos a expirar</h2>
          {proxExpiran.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Todo en orden ✓</p>
          ) : (
            <div className="space-y-3">
              {proxExpiran.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.expira}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    item.alert === "expira" ? "bg-red/10 text-red" : "bg-orange/10 text-orange"
                  }`}>
                    {item.alert === "expira" ? "¡Mañana!" : "Poco"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recetas disponibles */}
      <div className="mt-6 bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">🍽️ Recetas con ingredientes disponibles</h2>
          <Link href="/recetas" className="text-xs text-green-dark font-semibold hover:underline">Ver todas →</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {disponibles.map(r => (
            <div key={r.id} className="flex items-center gap-4 py-3">
              <span className="text-2xl w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">{r.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{r.nombre}</p>
                <p className="text-xs text-gray-400">{r.tiempo} · {r.ingredientes}</p>
              </div>
              <span className="text-xs font-semibold bg-green-soft text-green-dark px-2.5 py-1 rounded-full">✓ Disponible</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8">
      <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-[16px] h-24 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-[16px] h-48 animate-pulse" />
        <div className="bg-white rounded-[16px] h-48 animate-pulse" />
      </div>
    </div>
  );
}
