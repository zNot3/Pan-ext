"use client";
import { useState } from "react";
import { inventario as initialInv, InventarioItem } from "@/lib/data";

export default function InventarioPage() {
  const [items, setItems]       = useState<InventarioItem[]>(initialInv);
  const [filter, setFilter]     = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ name:"", icon:"🛒", expira:"", qty:"1" });

  const filters = ["Todos", "⚠️ Expiran pronto", "🍃 Frescos", "❄️ Refrigerados"];
  const alertCount = items.filter(i => i.alert).length;

  const filtered = filter === "Todos" ? items
    : filter === "⚠️ Expiran pronto" ? items.filter(i => i.alert)
    : items;

  const changeQty = (id: number, delta: number) =>
    setItems(prev => prev.map(i => i.id === id
      ? { ...i, qty: Math.max(0, i.qty + delta) } : i));

  const addItem = () => {
    if (!form.name.trim()) return;
    setItems(prev => [...prev, {
      id: Date.now(),
      name: form.name.trim(),
      icon: form.icon.trim() || "🛒",
      expira: form.expira || "—",
      qty: parseInt(form.qty) || 1,
      alert: null,
      cal:"—", prot:"—", gras:"—", carb:"—"
    }]);
    setForm({ name:"", icon:"🛒", expira:"", qty:"1" });
    setShowModal(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-400 mt-1">{items.length} elementos · {alertCount} alertas activas</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-green-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-mid transition-colors">
          + Nuevo elemento
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? "bg-green-dark text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-green-mid"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-xl2 shadow-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {item.icon}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Expira: {item.expira}</p>
                {item.alert === "expira" && (
                  <span className="inline-block text-[10px] font-bold bg-red/10 text-red px-2 py-0.5 rounded-full mt-1">¡Mañana!</span>
                )}
                {item.alert === "poco" && (
                  <span className="inline-block text-[10px] font-bold bg-orange/10 text-orange px-2 py-0.5 rounded-full mt-1">Queda poco</span>
                )}
              </div>
            </div>

            {/* Qty controls */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button onClick={() => changeQty(item.id, -1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors text-sm">
                −
              </button>
              <span className="text-base font-bold text-gray-800 w-8 text-center">{item.qty}</span>
              <button onClick={() => changeQty(item.id, 1)}
                className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors text-sm">
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl2 p-6 w-96 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 text-lg mb-5">Nuevo elemento</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Nombre *</label>
                <input autoFocus value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
                  placeholder="Ej: Manzana" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Emoji</label>
                <input value={form.icon} onChange={e => setForm(p=>({...p,icon:e.target.value}))}
                  placeholder="🍎" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Fecha de expiración</label>
                <input value={form.expira} onChange={e => setForm(p=>({...p,expira:e.target.value}))}
                  placeholder="dd/mm/aa" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Cantidad</label>
                <input type="number" min="1" value={form.qty} onChange={e => setForm(p=>({...p,qty:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setShowModal(false)}
                className="text-sm text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={addItem}
                className="text-sm bg-green-dark text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-mid transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
