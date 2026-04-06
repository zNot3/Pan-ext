import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, onSnapshot, query, where,
  orderBy, serverTimestamp, Timestamp,
  DocumentData, QuerySnapshot
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const userCol = (uid: string, col: string) =>
  collection(db, "users", uid, col);

const userDoc = (uid: string, col: string, id: string) =>
  doc(db, "users", uid, col, id);

// ─── Inventario ───────────────────────────────────────────────────────────────
export interface InventarioDoc {
  id?: string;
  name: string;
  icon: string;
  expira: string;
  qty: number;
  alert: "expira" | "poco" | null;
  cal: string;
  prot: string;
  gras: string;
  carb: string;
  creadoEn?: Timestamp;
}

export const getInventario = async (uid: string): Promise<InventarioDoc[]> => {
  const snap = await getDocs(query(userCol(uid, "inventario"), orderBy("creadoEn", "asc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as InventarioDoc));
};

export const addInventarioItem = async (uid: string, item: Omit<InventarioDoc, "id">) => {
  return addDoc(userCol(uid, "inventario"), { ...item, creadoEn: serverTimestamp() });
};

export const updateInventarioItem = async (uid: string, id: string, data: Partial<InventarioDoc>) => {
  return updateDoc(userDoc(uid, "inventario", id), data);
};

export const deleteInventarioItem = async (uid: string, id: string) => {
  return deleteDoc(userDoc(uid, "inventario", id));
};

// ─── Compras ──────────────────────────────────────────────────────────────────
export interface CompraDoc {
  id?: string;
  name: string;
  qty: string;
  category: string;
  checked: boolean;
  fromIA?: boolean;
  creadoEn?: Timestamp;
}

export const getCompras = async (uid: string): Promise<CompraDoc[]> => {
  const snap = await getDocs(query(userCol(uid, "compras"), orderBy("creadoEn", "asc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CompraDoc));
};

export const addCompraItem = async (uid: string, item: Omit<CompraDoc, "id">) => {
  return addDoc(userCol(uid, "compras"), { ...item, creadoEn: serverTimestamp() });
};

export const updateCompraItem = async (uid: string, id: string, data: Partial<CompraDoc>) => {
  return updateDoc(userDoc(uid, "compras", id), data);
};

export const deleteCompraItem = async (uid: string, id: string) => {
  return deleteDoc(userDoc(uid, "compras", id));
};

// ─── Notificaciones ───────────────────────────────────────────────────────────
export interface NotificacionDoc {
  id?: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  tipo: "urgente" | "aviso" | "info" | "ia" | "sistema";
  leida: boolean;
  creadoEn?: Timestamp;
}

export const getNotificaciones = async (uid: string): Promise<NotificacionDoc[]> => {
  const snap = await getDocs(query(userCol(uid, "notificaciones"), orderBy("creadoEn", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificacionDoc));
};

export const marcarNotificacionLeida = async (uid: string, id: string) => {
  return updateDoc(userDoc(uid, "notificaciones", id), { leida: true });
};

export const marcarTodasLeidas = async (uid: string) => {
  const snap = await getDocs(query(userCol(uid, "notificaciones"), where("leida", "==", false)));
  const updates = snap.docs.map(d => updateDoc(d.ref, { leida: true }));
  return Promise.all(updates);
};

// ─── Perfil de usuario ────────────────────────────────────────────────────────
export interface PerfilDoc {
  nombre: string;
  email: string;
  notifExpiracion: boolean;
  sugerenciasIA: boolean;
  modoOscuro: boolean;
  resumenSemanal: boolean;
}

export const getPerfil = async (uid: string): Promise<PerfilDoc | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as PerfilDoc) : null;
};

export const updatePerfil = async (uid: string, data: Partial<PerfilDoc>) => {
  return updateDoc(doc(db, "users", uid), data);
};

export const createPerfil = async (uid: string, data: PerfilDoc) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await updateDoc(ref, data).catch(() =>
      addDoc(collection(db, "users"), { uid, ...data })
    );
  }
};

// ─── Seed datos iniciales para usuario nuevo ──────────────────────────────────
// Crea solo el documento de perfil, sin datos de ejemplo
export const seedUserData = async (_uid: string) => {
  // Intencionalmente vacío — el usuario empieza con inventario,
  // compras y notificaciones limpios
  return Promise.resolve();
};
