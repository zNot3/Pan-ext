"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getInventario, addInventarioItem, updateInventarioItem,
  deleteInventarioItem, InventarioDoc
} from "@/lib/firestore";

export default function InventarioPage() {
  const { user } = useAuth();
  const [items, setItems]         = useState<InventarioDoc[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name:"", icon:"🛒", expira:"", qty:"1" });
  const [saving, setSaving]       = useState(false);
  // Inline editing state
  const [editingExpira, setEditingExpira] = useState<string | null>(null);
  const [editingExpiraValue, setEditingExpiraValue] = useState("");
  const expiraInputRef = useRef<HTMLInputElement>(null);

  const filters = ["Todos", "⚠️ Expiran pronto"];
  const alertCount = items.filter(i => i.alert).length;

  useEffect(() => {
    if (!user) return;
    getInventario(user.uid).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (editingExpira) expiraInputRef.current?.focus();
  }, [editingExpira]);

  const filtered = filter === "Todos" ? items : items.filter(i => i.alert);

  const changeQty = async (item: InventarioDoc, delta: number) => {
    if (!user || !item.id) return;
    const newQty = Math.max(0, item.qty + delta);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: newQty } : i));
    await updateInventarioItem(user.uid, item.id, { qty: newQty });
  };

  const startEditExpira = (item: InventarioDoc) => {
    setEditingExpira(item.id!);
    setEditingExpiraValue(item.expira === "—" ? "" : item.expira);
  };

  const saveExpira = async (item: InventarioDoc) => {
    if (!user || !item.id) return;
    const newExpira = editingExpiraValue.trim() || "—";
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, expira: newExpira } : i));
    setEditingExpira(null);
    await updateInventarioItem(user.uid, item.id, { expira: newExpira });
  };

  const deleteItem = async (item: InventarioDoc) => {
    if (!user || !item.id) return;
    setItems(prev => prev.filter(i => i.id !== item.id));
    await deleteInventarioItem(user.uid, item.id);
  };

  const addItem = async () => {
    if (!user || !form.name.trim()) return;
    setSaving(true);
    const newItem: Omit<InventarioDoc, "id"> = {
      name:   form.name.trim(),
      icon:   form.icon.trim() || "🛒",
      expira: form.expira || "—",
      qty:    parseInt(form.qty) || 1,
      alert:  null,
      cal:"—", prot:"—", gras:"—", carb:"—"
    };
    const ref = await addInventarioItem(user.uid, newItem);
    setItems(prev => [...prev, { ...newItem, id: ref.id }]);
    setForm({ name:"", icon:"🛒", expira:"", qty:"1" });
    setShowModal(false);
    setSaving(false);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-400 mt-1">
            {items.length} elemento{items.length !== 1 ? "s" : ""}
            {alertCount > 0 && ` · ${alertCount} alerta${alertCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-green-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-mid transition-colors">
          + Nuevo elemento
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? "bg-green-dark text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-green-mid"
            }`}>{f}</button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-5xl block mb-3">📦</span>
          <p className="text-sm font-medium">
            {filter !== "Todos" ? "No hay elementos con alertas" : "Tu inventario está vacío"}
          </p>
          {filter === "Todos" && (
            <button onClick={() => setShowModal(true)}
              className="mt-4 text-green-dark font-semibold text-sm hover:underline">
              + Agregar el primer producto
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Producto</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Cantidad</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Fecha expiración</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Estado</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest"></p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {filtered.map(item => (
              <div key={item.id}
                className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors">

                {/* Producto */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                </div>

                {/* Cantidad */}
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(item, -1)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors text-xs">
                    −
                  </button>
                  <span className="text-sm font-bold text-gray-800 w-6 text-center">{item.qty}</span>
                  <button onClick={() => changeQty(item, 1)}
                    className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors text-xs">
                    +
                  </button>
                </div>

                {/* Fecha expiración — editable inline */}
                <div>
                  {editingExpira === item.id ? (
                    <input
                      ref={expiraInputRef}
                      type="text"
                      value={editingExpiraValue}
                      onChange={e => setEditingExpiraValue(e.target.value)}
                      onBlur={() => saveExpira(item)}
                      onKeyDown={e => {
                        if (e.key === "Enter") saveExpira(item);
                        if (e.key === "Escape") setEditingExpira(null);
                      }}
                      placeholder="dd/mm/aa"
                      className="border border-green-mid rounded-lg px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-green-mid"
                    />
                  ) : (
                    <button
                      onClick={() => startEditExpira(item)}
                      className="flex items-center gap-1.5 group"
                      title="Click para editar">
                      <span className={`text-sm ${item.expira === "—" ? "text-gray-300" : "text-gray-600"}`}>
                        {item.expira}
                      </span>
                      <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✏️</span>
                    </button>
                  )}
                </div>

                {/* Estado */}
                <div>
                  {item.alert === "expira" && (
                    <span className="text-[10px] font-bold bg-red/10 text-red px-2 py-1 rounded-full">¡Expirará!</span>
                  )}
                  {item.alert === "poco" && (
                    <span className="text-[10px] font-bold bg-orange/10 text-orange px-2 py-1 rounded-full">Queda poco</span>
                  )}
                  {!item.alert && (
                    <span className="text-[10px] font-bold bg-green-soft text-green-dark px-2 py-1 rounded-full">Bien</span>
                  )}
                </div>

                {/* Eliminar */}
                <button onClick={() => deleteItem(item)}
                  className="text-gray-300 hover:text-red transition-colors text-sm px-1"
                  title="Eliminar">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal agregar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[16px] p-6 w-96 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 text-lg mb-5">Nuevo elemento</h3>
            <div className="space-y-3">
              {[
                { label:"Nombre *",            key:"name",   type:"text",   placeholder:"Ej: Manzana"  },
                { label:"Emoji",               key:"icon",   type:"text",   placeholder:"🍎"           },
                { label:"Fecha de expiración", key:"expira", type:"text",   placeholder:"dd/mm/aa"     },
                { label:"Cantidad",            key:"qty",    type:"number", placeholder:"1"            },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 font-medium block mb-1">{field.label}</label>
                  <input
                    autoFocus={field.key === "name"}
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setShowModal(false)}
                className="text-sm text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg">
                Cancelar
              </button>
              <button onClick={addItem} disabled={saving}
                className="text-sm bg-green-dark text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-mid transition-colors disabled:opacity-60">
                {saving ? "Guardando…" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded w-32 mb-8 animate-pulse" />
      <div className="bg-white rounded-[16px] h-64 animate-pulse" />
    </div>
  );
}
