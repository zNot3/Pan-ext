"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getCompras, addCompraItem, updateCompraItem, deleteCompraItem, CompraDoc,
  addInventarioItem
} from "@/lib/firestore";

const SUGERENCIAS_INICIALES = [
  "Limón", "Espinaca", "Queso parmesano", "Crema de leche",
  "Cebolla morada", "Albahaca fresca",
];

const UNIDADES = ["und", "g", "kg", "ml", "L", "taza", "tbsp", "tsp", "paq", "caja"];

// ── Qty badge editable inline ─────────────────────────────────────────────────
function QtyBadge({ item, onSave }: { item: CompraDoc; onSave: (qty: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState("");
  const [unit, setUnit]       = useState("und");
  const ref = useRef<HTMLInputElement>(null);

  const open = () => {
    if (item.checked) return;
    // Parse existing qty like "400 ml" or "x1"
    const match = item.qty.match(/^x?(\d+(?:\.\d+)?)\s*(.*)$/);
    setVal(match ? match[1] : "1");
    setUnit(match && match[2] && UNIDADES.includes(match[2]) ? match[2] : "und");
    setEditing(true);
    setTimeout(() => ref.current?.select(), 0);
  };

  const save = () => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      onSave(unit === "und" ? `x${n % 1 === 0 ? n : n}` : `${n} ${unit}`);
    }
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={open}
        title={item.checked ? "" : "Editar cantidad"}
        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 transition-colors ${
          item.checked
            ? "text-gray-300 cursor-default"
            : "text-gray-500 bg-gray-100 hover:bg-green-soft hover:text-green-dark cursor-pointer"
        }`}>
        {item.qty}
        {!item.checked && <span className="ml-1 opacity-40">✏</span>}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
      <input
        ref={ref}
        type="number"
        min="0.1"
        step="any"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        className="w-16 text-xs border border-green-mid rounded-lg px-2 py-1 focus:outline-none text-center"
      />
      <select
        value={unit}
        onChange={e => setUnit(e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-1 py-1 focus:outline-none bg-white">
        {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <button onClick={save}
        className="text-xs bg-green-dark text-white px-2 py-1 rounded-lg hover:bg-green-mid transition-colors">
        ✓
      </button>
    </div>
  );
}

// ── Modal: pedir fecha de expiración al marcar como comprado ──────────────────
interface ExpiraModalProps {
  item: CompraDoc;
  onConfirm: (expira: string) => void;
  onCancel: () => void;
}

function formatDateInput(raw: string, prev: string): string {
  // Strip everything that isn't a digit
  const digits = raw.replace(/\D/g, "").slice(0, 6); // ddmmyy → max 6 digits
  // Insert slashes automatically
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
  return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
}

function isValidDate(val: string): boolean {
  // Expects dd/mm/yy or dd/mm/yyyy
  const parts = val.split("/");
  if (parts.length !== 3) return false;
  const [d, m, yRaw] = parts.map(Number);
  const y = yRaw < 100 ? 2000 + yRaw : yRaw;
  if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
  if (m < 1 || m > 12 || d < 1) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function ExpiraModal({ item, onConfirm, onCancel }: ExpiraModalProps) {
  const [expira, setExpira] = useState("");
  const [error, setError]   = useState("");

  const handleChange = (raw: string) => {
    setExpira(prev => formatDateInput(raw, prev));
    setError("");
  };

  const handleConfirm = () => {
    if (expira && !isValidDate(expira)) {
      setError("Fecha inválida. Usá el formato dd/mm/aa.");
      return;
    }
    onConfirm(expira);
  };

  const complete = expira.replace(/\D/g, "").length === 6;
  const valid    = complete && isValidDate(expira);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}>
      <div className="bg-white rounded-[16px] p-6 w-80 shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-soft rounded-xl flex items-center justify-center text-xl">✓</div>
          <div>
            <h3 className="font-semibold text-gray-800">¡Producto comprado!</h3>
            <p className="text-xs text-gray-400">{item.name} · {item.qty}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          ¿Cuándo expira este producto? Se agregará automáticamente a tu inventario.
        </p>
        <div className="mb-4">
          <label className="text-xs text-gray-500 font-medium block mb-1">
            Fecha de expiración <span className="text-gray-300">(opcional)</span>
          </label>
          <div className="relative">
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={expira}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") onCancel(); }}
              placeholder="dd/mm/aa"
              maxLength={8}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none pr-8 transition-colors ${
                error
                  ? "border-red-400 focus:border-red-400"
                  : valid
                  ? "border-green-mid focus:border-green-mid"
                  : "border-gray-200 focus:border-green-mid"
              }`}
            />
            {complete && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${valid ? "text-green-dark" : "text-red-400"}`}>
                {valid ? "✓" : "✕"}
              </span>
            )}
          </div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 text-sm text-gray-500 py-2.5 hover:bg-gray-100 rounded-xl transition-colors">
            Cancelar
          </button>
          <button onClick={handleConfirm}
            className="flex-1 text-sm bg-green-dark text-white font-semibold py-2.5 rounded-xl hover:bg-green-mid transition-colors">
            Agregar al inventario
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: nuevo elemento ─────────────────────────────────────────────────────
interface NuevoModalProps {
  onConfirm: (name: string, qty: string) => void;
  onCancel: () => void;
  saving: boolean;
}

function NuevoModal({ onConfirm, onCancel, saving }: NuevoModalProps) {
  const [name, setName] = useState("");
  const [val, setVal]   = useState("1");
  const [unit, setUnit] = useState("und");

  const buildQty = () =>
    unit === "und" ? `x${parseFloat(val) || 1}` : `${parseFloat(val) || 1} ${unit}`;

  const submit = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), buildQty());
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}>
      <div className="bg-white rounded-[16px] p-6 w-80 shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-gray-800 mb-4">Nuevo elemento</h3>

        <label className="text-xs text-gray-500 font-medium block mb-1">Producto</label>
        <input autoFocus type="text" value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Ej: Leche, Arroz, Manzana…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-mid mb-4" />

        <label className="text-xs text-gray-500 font-medium block mb-1">Cantidad</label>
        <div className="flex gap-2 mb-5">
          <input
            type="number"
            min="0.1"
            step="any"
            value={val}
            onChange={e => setVal(e.target.value)}
            className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-mid text-center"
          />
          <select
            value={unit}
            onChange={e => setUnit(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-mid bg-white">
            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onCancel}
            className="text-sm text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={submit} disabled={saving || !name.trim()}
            className="text-sm bg-green-dark text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-mid transition-colors disabled:opacity-60">
            {saving ? "Guardando…" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ComprasPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<CompraDoc[]>([]);
  const [sugs, setSugs]             = useState<string[]>(SUGERENCIAS_INICIALES);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [pendingCheck, setPendingCheck] = useState<CompraDoc | null>(null);

  useEffect(() => {
    if (!user) return;
    getCompras(user.uid).then(data => { setItems(data); setLoading(false); });
  }, [user]);

  const completed = items.filter(i => i.checked).length;
  const pending   = items.filter(i => !i.checked).length;
  const progress  = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  const handleCheck = (item: CompraDoc) => {
    if (item.checked) uncheck(item);
    else setPendingCheck(item);
  };

  const uncheck = async (item: CompraDoc) => {
    if (!user || !item.id) return;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: false } : i));
    await updateCompraItem(user.uid, item.id, { checked: false });
  };

  const confirmBought = async (expira: string) => {
    if (!user || !pendingCheck || !pendingCheck.id) return;
    setItems(prev => prev.map(i => i.id === pendingCheck.id ? { ...i, checked: true } : i));
    await updateCompraItem(user.uid, pendingCheck.id, { checked: true });
    const qtyMatch = pendingCheck.qty.match(/[\d.]+/);
    const qtyNum   = qtyMatch ? parseFloat(qtyMatch[0]) : 1;
    await addInventarioItem(user.uid, {
      name:   pendingCheck.name,
      icon:   "🛒",
      expira: expira.trim() || "—",
      qty:    isNaN(qtyNum) || qtyNum <= 0 ? 1 : qtyNum,
      alert:  null,
      cal:"—", prot:"—", gras:"—", carb:"—",
    });
    setPendingCheck(null);
  };

  const updateQty = async (item: CompraDoc, qty: string) => {
    if (!user || !item.id) return;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, qty } : i));
    await updateCompraItem(user.uid, item.id, { qty });
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

  const addItem = async (name: string, qty: string) => {
    if (!user) return;
    setSaving(true);
    const newItem: Omit<CompraDoc, "id"> = {
      name, qty, category: "General", checked: false
    };
    const ref = await addCompraItem(user.uid, newItem);
    setItems(prev => [...prev, { ...newItem, id: ref.id }]);
    setShowModal(false); setSaving(false);
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

                    {/* Qty badge — editable */}
                    <QtyBadge item={item} onSave={qty => updateQty(item, qty)} />

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

          <div className="bg-green-soft rounded-[16px] p-4">
            <p className="text-xs text-green-dark font-semibold mb-1">💡 ¿Sabías que?</p>
            <p className="text-xs text-green-dark/80">
              Tocá la cantidad de un ítem (ej: <strong>x1</strong>) para cambiarla — podés usar ml, g, kg, L y más.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: nuevo elemento */}
      {showModal && (
        <NuevoModal
          onConfirm={addItem}
          onCancel={() => setShowModal(false)}
          saving={saving}
        />
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
