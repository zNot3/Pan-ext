"use client";
import { useState } from "react";

export default function PerfilPage() {
  const [prefs, setPrefs] = useState({
    notifExpiracion: true,
    sugerenciasIA:   true,
    modoOscuro:      false,
    resumenSemanal:  false,
  });
  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Mi Cuenta</h1>
        <p className="text-gray-400 mt-1">Configuración y preferencias</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
            <div className="bg-gradient-to-br from-green-dark to-green-mid p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl mx-auto mb-3">👤</div>
              <h2 className="font-display font-bold text-white text-xl">Nombre Apellido</h2>
              <p className="text-green-soft text-sm mt-1">usuario@correo.com</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[{v:"12",l:"Inventario"},{v:"34",l:"Recetas"},{v:"7",l:"Sem. activo"}].map(s=>(
                  <div key={s.l} className="text-center">
                    <p className="text-white font-bold text-lg">{s.v}</p>
                    <p className="text-green-soft text-[10px]">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                ✏️ Editar perfil
              </button>
              <button className="w-full bg-red/10 text-red text-sm font-medium py-2.5 rounded-xl hover:bg-red/20 transition-colors">
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="col-span-2 space-y-4">
          {/* Preferencias */}
          <div className="bg-white rounded-xl2 shadow-card p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">⚙️ Preferencias</p>
            <div className="divide-y divide-gray-100">
              {[
                { key:"notifExpiracion" as const, icon:"🔔", label:"Notificaciones de expiración", desc:"Recibe alertas cuando tus productos estén por vencer" },
                { key:"sugerenciasIA"   as const, icon:"✨", label:"Sugerencias de IA",            desc:"Recibe sugerencias automáticas basadas en tu inventario" },
                { key:"modoOscuro"      as const, icon:"🌙", label:"Modo oscuro",                   desc:"Cambia la apariencia de la aplicación" },
                { key:"resumenSemanal"  as const, icon:"📧", label:"Resumen semanal por correo",   desc:"Recibe un resumen de tu despensa cada semana" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(item.key)}
                    style={{
                      position: "relative",
                      width: "48px",
                      height: "24px",
                      borderRadius: "9999px",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      backgroundColor: prefs[item.key] ? "#2D6A4F" : "#D1D5DB",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "3px",
                        left: prefs[item.key] ? "27px" : "3px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "9999px",
                        backgroundColor: "white",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        transition: "left 0.2s",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cuenta */}
          <div className="bg-white rounded-xl2 shadow-card p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">🔐 Cuenta</p>
            <div className="divide-y divide-gray-100">
              {[
                { icon:"🔒", label:"Cambiar contraseña" },
                { icon:"🗑️", label:"Eliminar cuenta", danger:true },
              ].map(item => (
                <button key={item.label}
                  className={`w-full flex items-center justify-between py-4 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors ${item.danger ? "text-red" : "text-gray-700"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${item.danger ? "bg-red/10" : "bg-gray-100"}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* App info */}
          <div className="bg-gradient-to-br from-green-dark to-green-mid rounded-xl2 p-5 flex items-center gap-4">
            <span className="text-3xl">🌿</span>
            <div>
              <p className="text-white font-bold">Pan-Ext</p>
              <p className="text-green-soft text-xs">Versión 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
