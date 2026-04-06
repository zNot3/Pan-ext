import {
  collection, getDocs, addDoc, deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { InventarioDoc } from "./firestore";

// ─── Parse date dd/mm/yyyy ────────────────────────────────────────────────────
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
  return Math.round((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Derive effective status — manual override wins, otherwise infer from date/qty
function effectiveStatus(item: InventarioDoc): InventarioDoc["alert"] {
  if (item.alert && item.alert !== "bien") return item.alert;
  const date = parseDate(item.expira);
  if (date) {
    const days = diffDays(date);
    if (days < 0)   return "expirado";
    if (days === 0) return "expira-hoy";
    if (days <= 7)  return "expira-pronto";
  }
  if (item.qty <= 1 && item.qty > 0) return "poco";
  return null;
}

// ─── Generate and sync notifications ─────────────────────────────────────────
export async function syncNotificaciones(uid: string, inventario: InventarioDoc[]) {
  const notifCol = collection(db, "users", uid, "notificaciones");

  // Delete ALL existing notifications before regenerating
  // (includes legacy ones that may not have the "auto" field)
  const oldSnap = await getDocs(notifCol);
  await Promise.all(oldSnap.docs.map(d => deleteDoc(d.ref)));

  const nuevas: {
    titulo: string;
    descripcion: string;
    tiempo: string;
    tipo: "urgente" | "aviso";
    leida: boolean;
    auto: boolean;
  }[] = [];

  for (const item of inventario) {
    const status = effectiveStatus(item);
    const label  = `${item.icon} ${item.name}`;
    const date   = parseDate(item.expira);
    const days   = date ? diffDays(date) : null;

    switch (status) {
      case "expirado":
        nuevas.push({
          titulo:      `${label} expiró`,
          descripcion: days !== null
            ? `Venció hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? "s" : ""}. Revisá si todavía es seguro consumirlo.`
            : "Este producto está marcado como expirado.",
          tiempo: "Ahora",
          tipo:   "urgente",
          leida:  false,
          auto:   true,
        });
        break;

      case "expira-hoy":
        nuevas.push({
          titulo:      `${label} expira hoy`,
          descripcion: "¡Úsalo hoy antes de que venza!",
          tiempo:      "Hoy",
          tipo:        "urgente",
          leida:       false,
          auto:        true,
        });
        break;

      case "expira-pronto":
        nuevas.push({
          titulo:      days === 1
            ? `${label} expira mañana`
            : `${label} expira en ${days} días`,
          descripcion: `Vence el ${item.expira}. Considerá usarlo pronto.`,
          tiempo:      days === 1 ? "Mañana" : `En ${days} días`,
          tipo:        days !== null && days <= 3 ? "urgente" : "aviso",
          leida:       false,
          auto:        true,
        });
        break;

      case "poco":
        nuevas.push({
          titulo:      `Queda poco de ${label}`,
          descripcion: `Solo queda ${item.qty} unidad. Considerá agregarlo a tu lista de compras.`,
          tiempo:      "Ahora",
          tipo:        "aviso",
          leida:       false,
          auto:        true,
        });
        break;

      default:
        break;
    }
  }

  await Promise.all(
    nuevas.map(n => addDoc(notifCol, { ...n, creadoEn: serverTimestamp() }))
  );

  return nuevas.length;
}
