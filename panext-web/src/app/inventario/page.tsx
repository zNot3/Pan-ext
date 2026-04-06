"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getInventario, addInventarioItem, updateInventarioItem,
  deleteInventarioItem, InventarioDoc
} from "@/lib/firestore";
import { useNotif } from "@/context/NotifContext";

// ── Types ────────────────────────────────────────────────────────────────────
type AlertStatus = InventarioDoc["alert"];

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

const STATUS_CONFIG: Record<NonNullable<AlertStatus> | "bien", StatusConfig> = {
  "expirado":      { label: "Expirado",      bg: "bg-red/10",     text: "text-red",        dot: "bg-red"         },
  "expira-hoy":    { label: "Expira hoy",    bg: "bg-red/10",     text: "text-red",        dot: "bg-red"         },
  "expira-pronto": { label: "Expira pronto", bg: "bg-orange/10",  text: "text-orange",     dot: "bg-orange"      },
  "bien":          { label: "Bien",          bg: "bg-green-soft", text: "text-green-dark", dot: "bg-green-dark"  },
  "poco":          { label: "Queda poco",    bg: "bg-orange/10",  text: "text-orange",     dot: "bg-orange"      },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseDate(str: string): Date | null {
  if (!str || str === "—") return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  const year = y < 100 ? 2000 + y : y;
  if (isNaN(d) || isNaN(m) || isNaN(year)) return null;
  return new Date(year, m - 1, d);
}

function diffDays(date: Date): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const t   = new Date(date); t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / 86400000);
}

function calcStatus(item: InventarioDoc): NonNullable<AlertStatus> {
  // If manually overridden, respect it
  if (item.alert && item.alert !== "bien") return item.alert;
  const date = parseDate(item.expira);
  if (date) {
    const days = diffDays(date);
    if (days < 0)  return "expirado";
    if (days === 0) return "expira-hoy";
    if (days <= 7)  return "expira-pronto";
  }
  if (item.qty <= 1 && item.qty > 0) return "poco";
  return "bien";
}

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
  return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
}

function isValidDate(val: string): boolean {
  const parts = val.split("/");
  if (parts.length !== 3) return false;
  const [d, m, y] = parts.map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y) || y < 1000) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// ── Status dropdown ───────────────────────────────────────────────────────────
function StatusBadge({
  item,
  onUpdate,
}: {
  item: InventarioDoc;
  onUpdate: (status: AlertStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const status = calcStatus(item);
  const cfg    = STATUS_CONFIG[status];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options: Array<{ value: AlertStatus; label: string }> = [
    { value: null,            label: "Bien" },
    { value: "expira-pronto", label: "Expira pronto" },
    { value: "expira-hoy",   label: "Expira hoy" },
    { value: "expirado",     label: "Expirado" },
    { value: "poco",         label: "Queda poco" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${cfg.bg} ${cfg.text} hover:opacity-80`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
        <span className="opacity-60 text-[8px]">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[140px]">
          {options.map(opt => {
            const optKey = (opt.value ?? "bien") as NonNullable<AlertStatus> | "bien";
            const optCfg = STATUS_CONFIG[optKey];
            const selected = (opt.value ?? "bien") === (item.alert ?? "bien");
            return (
              <button
                key={String(opt.value)}
                onClick={() => { onUpdate(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${selected ? "font-bold" : ""}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${optCfg.dot}`} />
                <span className={optCfg.text}>{optCfg.label}</span>
                {selected && <span className="ml-auto text-green-dark">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InventarioPage() {
  const { user } = useAuth();
  const { refresh: refreshNotif } = useNotif();
  const [items, setItems]         = useState<InventarioDoc[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name:"", icon:"🛒", expira:"", qty:"1" });
  const [saving, setSaving]       = useState(false);

  // Inline expiry editing
  const [editingExpira, setEditingExpira]       = useState<string | null>(null);
  const [editingExpiraValue, setEditingExpiraValue] = useState("");
  const [expiraError, setExpiraError]           = useState("");
  const expiraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    getInventario(user.uid).then(data => { setItems(data); setLoading(false); });
  }, [user]);

  useEffect(() => {
    if (editingExpira) expiraInputRef.current?.focus();
  }, [editingExpira]);

  const alertCount = items.filter(i => {
    const s = calcStatus(i);
    return s === "expirado" || s === "expira-hoy" || s === "expira-pronto";
  }).length;

  const filters = ["Todos", "⚠️ Alertas"];

  const filtered = filter === "Todos"
    ? items
    : items.filter(i => {
        const s = calcStatus(i);
        return s === "expirado" || s === "expira-hoy" || s === "expira-pronto";
      });

  const changeQty = async (item: InventarioDoc, delta: number) => {
    if (!user || !item.id) return;
    const newQty = Math.max(0, item.qty + delta);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: newQty } : i));
    await updateInventarioItem(user.uid, item.id, { qty: newQty });
    refreshNotif();
  };

  const updateStatus = async (item: InventarioDoc, alert: InventarioDoc["alert"]) => {
    if (!user || !item.id) return;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, alert } : i));
    await updateInventarioItem(user.uid, item.id, { alert });
    refreshNotif();
  };

  const startEditExpira = (item: InventarioDoc) => {
    setEditingExpira(item.id!);
    setEditingExpiraValue(item.expira === "—" ? "" : item.expira);
    setExpiraError("");
  };

  const saveExpira = async (item: InventarioDoc) => {
    if (!user || !item.id) return;
    const val = editingExpiraValue.trim();
    if (val && !isValidDate(val)) {
      setExpiraError("Fecha inválida");
      expiraInputRef.current?.focus();
      return;
    }
    const newExpira = val || "—";
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, expira: newExpira } : i));
    setEditingExpira(null);
    setExpiraError("");
    await updateInventarioItem(user.uid, item.id, { expira: newExpira });
    refreshNotif();
  };

  const deleteItem = async (item: InventarioDoc) => {
    if (!user || !item.id) return;
    setItems(prev => prev.filter(i => i.id !== item.id));
    await deleteInventarioItem(user.uid, item.id);
    refreshNotif();
  };

  const addItem = async () => {
    if (!user || !form.name.trim()) return;
    if (form.expira && !isValidDate(form.expira)) return;
    setSaving(true);
    const newItem: Omit<InventarioDoc, "id"> = {
      name:   form.name.trim(),
      icon:   form.icon.trim() || "🛒",
      expira: form.expira || "—",
      qty:    parseInt(form.qty) || 1,
      alert:  null,
      cal:"—", prot:"—", gras:"—", carb:"—",
    };
    const ref = await addInventarioItem(user.uid, newItem);
    setItems(prev => [...prev, { ...newItem, id: ref.id }]);
    setForm({ name:"", icon:"🛒", expira:"", qty:"1" });
    setShowModal(false);
    setSaving(false);
    refreshNotif();
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
            {alertCount > 0 && (
              <span className="ml-2 text-xs font-bold text-red">
                · {alertCount} alerta{alertCount !== 1 ? "s" : ""}
              </span>
            )}
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

      {/* Empty */}
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
            {["Producto","Cantidad","Fecha expiración","Estado",""].map((h,i) => (
              <p key={i} className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{h}</p>
            ))}
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
                    <div>
                      <input
                        ref={expiraInputRef}
                        type="text"
                        inputMode="numeric"
                        value={editingExpiraValue}
                        onChange={e => {
                          setEditingExpiraValue(formatDateInput(e.target.value));
                          setExpiraError("");
                        }}
                        onBlur={() => saveExpira(item)}
                        onKeyDown={e => {
                          if (e.key === "Enter")  saveExpira(item);
                          if (e.key === "Escape") { setEditingExpira(null); setExpiraError(""); }
                        }}
                        maxLength={10}
                        placeholder="dd/mm/aaaa"
                        className={`border rounded-lg px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 ${
                          expiraError ? "border-red-400 focus:ring-red-300" : "border-green-mid focus:ring-green-mid"
                        }`}
                      />
                      {expiraError && <p className="text-[10px] text-red mt-0.5">{expiraError}</p>}
                    </div>
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

                {/* Estado — dropdown */}
                <StatusBadge item={item} onUpdate={alert => updateStatus(item, alert)} />

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
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Nombre *</label>
                <input autoFocus type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ej: Manzana"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Emoji</label>
                <input type="text" value={form.icon}
                  onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                  placeholder="🍎"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">
                  Fecha de expiración <span className="text-gray-300">(opcional)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.expira}
                  onChange={e => setForm(p => ({ ...p, expira: formatDateInput(e.target.value) }))}
                  maxLength={10}
                  placeholder="dd/mm/aaaa"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid ${
                    form.expira && !isValidDate(form.expira) ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {form.expira && !isValidDate(form.expira) && (
                  <p className="text-[10px] text-red mt-1">Fecha inválida — usá dd/mm/aaaa</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Cantidad</label>
                <input type="number" value={form.qty}
                  onChange={e => setForm(p => ({ ...p, qty: e.target.value }))}
                  placeholder="1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setShowModal(false)}
                className="text-sm text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg">
                Cancelar
              </button>
              <button onClick={addItem} disabled={saving || !form.name.trim() || (!!form.expira && !isValidDate(form.expira))}
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
