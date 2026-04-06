import {
  collection, getDocs, addDoc, deleteDoc,
  query, where, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { InventarioDoc } from "./firestore";

// ─── Parse date dd/mm/yy or dd/mm/yyyy ───────────────────────────────────────
function parseDate(str: string): Date | null {
  if (!str || str === "—") return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  const year = y < 100 ? 2000 + y : y;
  return new Date(year, m - 1, d);
}

function diffDays(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Generate and sync notifications ─────────────────────────────────────────
export async function syncNotificaciones(uid: string, inventario: InventarioDoc[]) {
  const notifCol = collection(db, "users", uid, "notificaciones");

  // Delete old auto-generated notifications (tipo urgente/aviso from inventory)
  const oldSnap = await getDocs(
    query(notifCol, where("auto", "==", true))
  );
  await Promise.all(oldSnap.docs.map(d => deleteDoc(d.ref)));

  // Generate new ones based on current inventory
  const nuevas: {
    titulo: string;
    descripcion: string;
    tiempo: string;
    tipo: "urgente" | "aviso";
    leida: boolean;
    auto: boolean;
  }[] = [];

  for (const item of inventario) {
    const fecha = parseDate(item.expira);
    if (!fecha) continue;
    const dias = diffDays(fecha);

    if (dias < 0) {
      nuevas.push({
        titulo:      `${item.icon} ${item.name} expiró`,
        descripcion: `Este producto venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}. Revisá si todavía es seguro consumirlo.`,
        tiempo:      "Ahora",
        tipo:        "urgente",
        leida:       false,
        auto:        true,
      });
    } else if (dias === 0) {
      nuevas.push({
        titulo:      `${item.icon} ${item.name} expira hoy`,
        descripcion: `¡Úsalo hoy! Este producto vence el día de hoy.`,
        tiempo:      "Hoy",
        tipo:        "urgente",
        leida:       false,
        auto:        true,
      });
    } else if (dias === 1) {
      nuevas.push({
        titulo:      `${item.icon} ${item.name} expira mañana`,
        descripcion: `Planificá usarlo mañana antes de que venza.`,
        tiempo:      "Mañana",
        tipo:        "urgente",
        leida:       false,
        auto:        true,
      });
    } else if (dias <= 3) {
      nuevas.push({
        titulo:      `${item.icon} ${item.name} expira en ${dias} días`,
        descripcion: `Vence el ${item.expira}. Considera usarlo pronto.`,
        tiempo:      `En ${dias} días`,
        tipo:        "aviso",
        leida:       false,
        auto:        true,
      });
    } else if (dias <= 7) {
      nuevas.push({
        titulo:      `${item.icon} ${item.name} expira esta semana`,
        descripcion: `Vence el ${item.expira} (en ${dias} días).`,
        tiempo:      `En ${dias} días`,
        tipo:        "aviso",
        leida:       false,
        auto:        true,
      });
    }

    // Low stock alert
    if (item.qty <= 1 && item.qty > 0) {
      nuevas.push({
        titulo:      `${item.icon} Queda poco de ${item.name}`,
        descripcion: `Solo queda ${item.qty} unidad. Considerá agregarlo a tu lista de compras.`,
        tiempo:      "Ahora",
        tipo:        "aviso",
        leida:       false,
        auto:        true,
      });
    }
  }

  // Insert new notifications
  await Promise.all(
    nuevas.map(n => addDoc(notifCol, { ...n, creadoEn: serverTimestamp() }))
  );

  return nuevas.length;
}
