"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPerfil, updatePerfil, PerfilDoc, uploadFotoPerfil } from "@/lib/firestore";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const [perfil, setPerfil]   = useState<PerfilDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoURL,       setPhotoURL]       = useState<string | null>(null);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadFotoPerfil(user.uid, file);
      setPhotoURL(url);
    } catch {
      // silently fail — photo just doesn't update
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    setPhotoURL(user.photoURL ?? null);
    getPerfil(user.uid).then(data => {
      setPerfil(data ?? {
        nombre: user.displayName ?? "Usuario",
        email:  user.email ?? "",
        notifExpiracion: true,
        sugerenciasIA:   true,
        modoOscuro:      false,
        resumenSemanal:  false,
      });
      setLoading(false);
    });
  }, [user]);

  const togglePref = async (key: keyof Omit<PerfilDoc, "nombre" | "email">) => {
    if (!user || !perfil) return;
    const updated = { ...perfil, [key]: !perfil[key] };
    setPerfil(updated);
    setSaving(true);
    await updatePerfil(user.uid, { [key]: updated[key] });
    setSaving(false);
  };

  if (loading) return <LoadingState />;
  if (!perfil)  return null;

  const prefs = [
    { key:"notifExpiracion" as const, icon:"🔔", label:"Notificaciones de expiración", desc:"Recibe alertas cuando tus productos estén por vencer" },
    { key:"sugerenciasIA"   as const, icon:"✨", label:"Sugerencias de IA",            desc:"Recibe sugerencias automáticas basadas en tu inventario" },
    { key:"modoOscuro"      as const, icon:"🌙", label:"Modo oscuro",                  desc:"Cambia la apariencia de la aplicación" },
    { key:"resumenSemanal"  as const, icon:"📧", label:"Resumen semanal por correo",   desc:"Recibe un resumen de tu despensa cada semana" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Mi Cuenta</h1>
        <p className="text-gray-400 mt-1">Configuración y preferencias {saving && <span className="text-xs text-green-dark ml-2">Guardando…</span>}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="col-span-1">
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">
            <div className="bg-gradient-to-br from-green-dark to-green-mid p-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-3 group">
                {photoURL ? (
                  <img src={photoURL} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                    {perfil.nombre?.[0]?.toUpperCase() ?? "👤"}
                  </div>
                )}
                <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploadingPhoto
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <span className="text-white text-xs font-semibold">📷</span>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                </label>
              </div>
              <h2 className="font-display font-bold text-white text-xl">{perfil.nombre}</h2>
              <p className="text-green-soft text-sm mt-1">{perfil.email}</p>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                ✏️ Editar perfil
              </button>
              <button onClick={logout}
                className="w-full bg-red/10 text-red text-sm font-medium py-2.5 rounded-xl hover:bg-red/20 transition-colors">
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="col-span-2 space-y-4">
          {/* Preferencias */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">⚙️ Preferencias</p>
            <div className="divide-y divide-gray-100">
              {prefs.map(item => (
                <div key={item.key} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePref(item.key)}
                    style={{
                      position: "relative",
                      width: "48px",
                      height: "24px",
                      borderRadius: "9999px",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      backgroundColor: perfil[item.key] ? "#2D6A4F" : "#D1D5DB",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "3px",
                        left: perfil[item.key] ? "27px" : "3px",
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
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">🔐 Cuenta</p>
            <div className="divide-y divide-gray-100">
              {[
                { icon:"🔒", label:"Cambiar contraseña", danger:false },
                { icon:"🗑️", label:"Eliminar cuenta",    danger:true  },
              ].map(item => (
                <button key={item.label}
                  className={`w-full flex items-center justify-between py-4 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors ${item.danger ? "text-red" : "text-gray-700"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${item.danger ? "bg-red/10" : "bg-gray-100"}`}>{item.icon}</div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* App info */}
          <div className="bg-gradient-to-br from-green-dark to-green-mid rounded-[16px] p-5 flex items-center gap-4">
            <span className="text-3xl">🌿</span>
            <div>
              <p className="text-white font-bold">Pan-Ext</p>
              <p className="text-green-soft text-xs">Versión 1.0.0 · Firebase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded w-32 mb-8 animate-pulse" />
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-[16px] h-64 animate-pulse" />
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-[16px] h-48 animate-pulse" />
          <div className="bg-white rounded-[16px] h-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
