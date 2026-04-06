"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getCompras, addCompraItem, updateCompraItem, deleteCompraItem, CompraDoc,
  addInventarioItem
} from "@/lib/firestore";

const SUGERENCIAS_INICIALES = [
  "Limón", "Espinaca", "Queso parmesano", "Crema de leche",
  "Cebolla morada", "Albahaca fresca",
];

// Modal: pedir fecha de expiración al marcar como comprado
interface ExpiraModalProps {
  item: CompraDoc;
  onConfirm: (expira: string) => void;
  onCancel: () => void;
}

function ExpiraModal({ item, onConfirm, onCancel }: ExpiraModalProps) {
  const [expira, setExpira] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}>
      <div className="bg-white rounded-[16px] p-6 w-80 shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-soft rounded-xl flex items-center justify-center text-xl">✓</div>
          <div>
            <h3 className="font-semibold text-gray-800">¡Producto comprado!</h3>
            <p className="text-xs text-gray-400">{item.name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          ¿Cuándo expira este producto? Se agregará automáticamente a tu inventario.
        </p>
        <div className="mb-4">
          <label className="text-xs text-gray-500 font-medium block mb-1">
            Fecha de expiración <span className="text-gray-300">(opcional)</span>
          </label>
          <input
            autoFocus
            type="text"
            value={expira}
            onChange={e => setExpira(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onConfirm(expira); if (e.key === "Escape") onCancel(); }}
            placeholder="dd/mm/aa"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 text-sm text-gray-500 py-2.5 hover:bg-gray-100 rounded-xl transition-colors">
            Cancelar
          </button>
          <button onClick={() => onConfirm(expira)}
            className="flex-1 text-sm bg-green-dark text-white font-semibold py-2.5 rounded-xl hover:bg-green-mid transition-colors">
            Agregar al inventario
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComprasPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<CompraDoc[]>([]);
  const [sugs, setSugs]             = useState<string[]>(SUGERENCIAS_INICIALES);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [newName, setNewName]       = useState("");
  const [saving, setSaving]         = useState(false);
  // Modal de expiración al marcar comprado
  const [pendingCheck, setPendingCheck] = useState<CompraDoc | null>(null);

  useEffect(() => {
    if (!user) return;
    getCompras(user.uid).then(data => { setItems(data); setLoading(false); });
  }, [user]);

  const completed = items.filter(i => i.checked).length;
  const pending   = items.filter(i => !i.checked).length;
  const progress  = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  // Clicking the checkbox: if unchecking, just uncheck. If checking → show modal
  const handleCheck = (item: CompraDoc) => {
    if (item.checked) {
      // Uncheck directly
      uncheck(item);
    } else {
      // Show expiry modal before marking as bought
      setPendingCheck(item);
    }
  };

  const uncheck = async (item: CompraDoc) => {
    if (!user || !item.id) return;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: false } : i));
    await updateCompraItem(user.uid, item.id, { checked: false });
  };

  const confirmBought = async (expira: string) => {
    if (!user || !pendingCheck || !pendingCheck.id) return;

    // 1. Mark as checked in compras
    setItems(prev => prev.map(i => i.id === pendingCheck.id ? { ...i, checked: true } : i));
    await updateCompraItem(user.uid, pendingCheck.id, { checked: true });

    // 2. Add to inventario
    await addInventarioItem(user.uid, {
      name:   pendingCheck.name,
      icon:   "🛒",
      expira: expira.trim() || "—",
      qty:    1,
      alert:  null,
      cal:"—", prot:"—", gras:"—", carb:"—",
    });

    setPendingCheck(null);
  };

  const remove = async (item: CompraDoc) => {
    if (!user || !item.id) return;
    setItems(prev => prev.filter(i => i.id !== item.id));
    await deleteCompraItem(user.uid, item.id);
  };

  const addSug = async (sug: string) => {
    if (!user) return;
    const newItem: Omit<CompraDoc, "id"> = {
      name: sug, qty: "x1", category: "IA", checked: false, fromIA: true
    };
    const ref = await addCompraItem(user.uid, newItem);
    setItems(prev => [...prev, { ...newItem, id: ref.id }]);
    setSugs(prev => prev.filter(s => s !== sug));
  };

  const addItem = async () => {
    if (!user || !newName.trim()) return;
    setSaving(true);
    const newItem: Omit<CompraDoc, "id"> = {
      name: newName.trim(), qty: "x1", category: "General", checked: false
    };
    const ref = await addCompraItem(user.uid, newItem);
    setItems(prev => [...prev, { ...newItem, id: ref.id }]);
    setNewName(""); setShowModal(false); setSaving(false);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Lista de Compras</h1>
          <p className="text-gray-400 mt-1">
            {completed} completado{completed !== 1 ? "s" : ""} · {pending} pendiente{pending !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
          + Nuevo elemento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lista */}
        <div className="col-span-2">
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">🛒 Tu lista</p>
            {items.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <span className="text-4xl block mb-3">🛒</span>
                <p className="text-sm">Lista vacía — ¡agregá tu primer producto!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    {/* Checkbox */}
                    <button onClick={() => handleCheck(item)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        item.checked ? "bg-gray-800 border-gray-800" : "border-gray-200 bg-white hover:border-green-mid"
                      }`}>
                      {item.checked && <span className="text-white text-[10px]">✓</span>}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.checked ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.fromIA
                          ? <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">✨ IA</span>
                          : <span className="text-[10px] text-gray-400">{item.category}</span>
                        }
                        {item.checked && (
                          <span className="text-[10px] text-green-dark font-medium">→ agregado al inventario</span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-gray-400 flex-shrink-0">{item.qty}</span>
                    <button onClick={() => remove(item)}
                      className="text-gray-300 hover:text-red transition-colors text-sm flex-shrink-0 px-1">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {sugs.length > 0 && (
            <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">✨ Sugerencias de IA</p>
              <p className="text-xs text-gray-400 mb-3">Basadas en tu inventario y recetas favoritas</p>
              <div className="flex flex-wrap gap-2">
                {sugs.map(sug => (
                  <button key={sug} onClick={() => addSug(sug)}
                    className="text-xs border border-gray-200 rounded-full px-3 py-1.5 hover:border-green-mid hover:bg-green-soft hover:text-green-dark transition-all">
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">📊 Progreso</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Completado</span>
              <span className="text-sm font-bold text-gray-800">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-dark rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{completed} de {items.length} ítems completados</p>
          </div>

          {/* Info tip */}
          <div className="bg-green-soft rounded-[16px] p-4">
            <p className="text-xs text-green-dark font-semibold mb-1">💡 ¿Sabías que?</p>
            <p className="text-xs text-green-dark/80">
              Al marcar un producto como comprado, te pediremos la fecha de expiración y lo agregaremos automáticamente a tu inventario.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: nuevo elemento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[16px] p-6 w-80 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-4">Nuevo elemento</h3>
            <input autoFocus type="text" value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addItem()}
              placeholder="Nombre del producto"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)}
                className="text-sm text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={addItem} disabled={saving}
                className="text-sm bg-green-dark text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-mid transition-colors disabled:opacity-60">
                {saving ? "Guardando…" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: fecha de expiración al comprar */}
      {pendingCheck && (
        <ExpiraModal
          item={pendingCheck}
          onConfirm={confirmBought}
          onCancel={() => setPendingCheck(null)}
        />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded w-32 mb-8 animate-pulse" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-[16px] h-64 animate-pulse" />
        <div className="space-y-4">
          <div className="bg-white rounded-[16px] h-32 animate-pulse" />
          <div className="bg-white rounded-[16px] h-28 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
