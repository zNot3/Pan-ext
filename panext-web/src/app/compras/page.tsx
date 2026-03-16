"use client";
import { useState } from "react";
import { compras as initialCompras, sugerenciasIA as initialSugs, CompraItem } from "@/lib/data";

export default function ComprasPage() {
  const [items, setItems]       = useState<CompraItem[]>(initialCompras);
  const [sugs, setSugs]         = useState<string[]>(initialSugs);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName]   = useState("");

  const completed = items.filter(i => i.checked).length;
  const pending   = items.filter(i => !i.checked).length;
  const progress  = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  const toggle = (id: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));

  const remove = (id: number) =>
    setItems(prev => prev.filter(i => i.id !== id));

  const addSug = (sug: string) => {
    setItems(prev => [...prev, {
      id: Date.now(), name: sug, qty: "x1", category: "IA", checked: false, fromIA: true
    }]);
    setSugs(prev => prev.filter(s => s !== sug));
  };

  const addItem = () => {
    if (!newName.trim()) return;
    setItems(prev => [...prev, {
      id: Date.now(), name: newName.trim(), qty: "x1", category: "General", checked: false
    }]);
    setNewName("");
    setShowModal(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Lista de Compras</h1>
          <p className="text-gray-400 mt-1">{completed} completados · {pending} pendientes</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
          + Nuevo elemento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lista */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl2 shadow-card p-6">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">🛒 Tu lista</p>
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  {/* Checkbox */}
                  <button onClick={() => toggle(item.id)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      item.checked ? "bg-gray-800 border-gray-800" : "border-gray-200 bg-white"
                    }`}>
                    {item.checked && <span className="text-white text-[10px]">✓</span>}
                  </button>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.checked ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.fromIA && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">✨ IA</span>
                      )}
                      {item.category && !item.fromIA && (
                        <span className="text-[10px] text-gray-400">{item.category}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-gray-400 flex-shrink-0">{item.qty}</span>
                  <button onClick={() => remove(item.id)}
                    className="text-gray-300 hover:text-red transition-colors text-sm flex-shrink-0 px-1">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Sugerencias + Progreso */}
        <div className="space-y-4">
          {/* Sugerencias IA */}
          {sugs.length > 0 && (
            <div className="bg-white rounded-xl2 shadow-card p-5">
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

          {/* Progreso */}
          <div className="bg-white rounded-xl2 shadow-card p-5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">📊 Progreso</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Completado</span>
              <span className="text-sm font-bold text-gray-800">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-dark rounded-full progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{completed} de {items.length} ítems completados</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl2 p-6 w-80 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-4">Nuevo elemento</h3>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addItem()}
              placeholder="Nombre del producto"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)}
                className="text-sm text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg">
                Cancelar
              </button>
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
