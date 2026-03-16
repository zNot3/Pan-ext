// ─── Types ────────────────────────────────────────────────────────────────────
export type AlertType = "expira" | "poco" | null;
export type NotifTipo = "urgente" | "aviso" | "info" | "ia" | "sistema";

export interface CompraItem {
  id: number;
  name: string;
  qty: string;
  category: string;
  checked: boolean;
  fromIA?: boolean;
}

export interface InventarioItem {
  id: number;
  name: string;
  icon: string;
  expira: string;
  qty: number;
  alert: AlertType;
  cal: string;
  prot: string;
  gras: string;
  carb: string;
}

export interface Notificacion {
  id: number;
  titulo: string;
  descripcion: string;
  tiempo: string;
  tipo: NotifTipo;
  leida: boolean;
}

export interface RecetaItem {
  id: number;
  nombre: string;
  icon: string;
  tiempo: string;
  porciones: string;
  dificultad: string;
  ingredientes: string;
  disponible: boolean;
  faltanN?: number;
  porcentaje: number;
  categoria: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
export const notificaciones: Notificacion[] = [
  { id:1, titulo:"¡Alerta de expiración!", descripcion:"La leche expira mañana. Úsala pronto.", tiempo:"Hace 2 horas", tipo:"urgente", leida:false },
  { id:2, titulo:"Queda poco pan", descripcion:"Solo 1 unidad restante. Considera agregar a tu lista.", tiempo:"Hace 5 horas", tipo:"aviso", leida:false },
  { id:3, titulo:"8 nuevas recetas disponibles", descripcion:"Con tu inventario actual puedes cocinar 8 recetas.", tiempo:"Hace 1 día", tipo:"info", leida:false },
  { id:4, titulo:"Los huevos vencen en 3 días", descripcion:"Vencimiento el 26/02/26. Planifica su uso.", tiempo:"Hace 1 día", tipo:"aviso", leida:true },
  { id:5, titulo:"El aguacate está en su punto", descripcion:"Hoy es el mejor día para consumirlo.", tiempo:"Hace 3 horas", tipo:"ia", leida:true },
  { id:6, titulo:"Tu lista de compras fue actualizada", descripcion:"Se agregaron 3 nuevos elementos.", tiempo:"Hace 2 días", tipo:"sistema", leida:true },
];

export const compras: CompraItem[] = [
  { id:1, name:"Tomates cherry",  qty:"500g",      category:"Verduras",  checked:false },
  { id:2, name:"Pasta penne",     qty:"x1",        category:"Pastas",    checked:false },
  { id:3, name:"Pollo (pechuga)", qty:"1kg",       category:"Carnes",    checked:false },
  { id:4, name:"Aceite de oliva", qty:"x1",        category:"Despensa",  checked:true  },
  { id:5, name:"Ajo",             qty:"x2 cabezas",category:"Verduras",  checked:true  },
];

export const sugerenciasIA: string[] = [
  "Limón", "Espinaca", "Queso parmesano", "Crema de leche",
  "Cebolla morada", "Pimiento rojo", "Albahaca fresca",
];

export const inventario: InventarioItem[] = [
  { id:1, name:"Leche entera",    icon:"🥛", expira:"22/02/26", qty:1, alert:"expira", cal:"61 kcal",  prot:"3.2g", gras:"3.3g", carb:"4.8g" },
  { id:2, name:"Pan integral",    icon:"🍞", expira:"24/02/26", qty:1, alert:"poco",   cal:"247 kcal", prot:"8.5g", gras:"3.4g", carb:"41g"  },
  { id:3, name:"Huevos",          icon:"🥚", expira:"26/02/26", qty:6, alert:null,     cal:"155 kcal", prot:"13g",  gras:"11g",  carb:"1.1g" },
  { id:4, name:"Queso manchego",  icon:"🧀", expira:"15/03/26", qty:2, alert:null,     cal:"392 kcal", prot:"25g",  gras:"32g",  carb:"0.5g" },
  { id:5, name:"Tomates",         icon:"🍅", expira:"28/02/26", qty:4, alert:null,     cal:"18 kcal",  prot:"0.9g", gras:"0.2g", carb:"3.9g" },
  { id:6, name:"Cebolla",         icon:"🧅", expira:"10/03/26", qty:3, alert:null,     cal:"40 kcal",  prot:"1.1g", gras:"0.1g", carb:"9.3g" },
  { id:7, name:"Aguacate",        icon:"🥑", expira:"23/02/26", qty:2, alert:"expira", cal:"160 kcal", prot:"2g",   gras:"15g",  carb:"9g"   },
  { id:8, name:"Limón",           icon:"🍋", expira:"05/03/26", qty:5, alert:null,     cal:"29 kcal",  prot:"1.1g", gras:"0.3g", carb:"9.3g" },
  { id:9, name:"Aceite de oliva", icon:"🫒", expira:"01/12/26", qty:1, alert:null,     cal:"884 kcal", prot:"0g",   gras:"100g", carb:"0g"   },
];

export const recetas: RecetaItem[] = [
  // Verdes
  { id:1,  nombre:"Ensalada mediterránea", icon:"🥗", tiempo:"20 min", porciones:"4", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:true,  porcentaje:100, categoria:"Verdes"    },
  { id:3,  nombre:"Sopa de acelga",        icon:"🍲", tiempo:"35 min", porciones:"4", dificultad:"Media",   ingredientes:"5 ingredientes", disponible:true,  porcentaje:100, categoria:"Verdes"    },
  { id:6,  nombre:"Wrap vegetariano",      icon:"🫔", tiempo:"20 min", porciones:"2", dificultad:"Fácil",   ingredientes:"6 ingredientes", disponible:true,  porcentaje:100, categoria:"Verdes"    },
  { id:9,  nombre:"Salteado de brócoli",   icon:"🥦", tiempo:"15 min", porciones:"2", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:true,  porcentaje:100, categoria:"Verdes"    },
  { id:13, nombre:"Bowl de kale",          icon:"🥬", tiempo:"10 min", porciones:"2", dificultad:"Fácil",   ingredientes:"5 ingredientes", disponible:false, porcentaje:75,  categoria:"Verdes",   faltanN:2 },
  { id:14, nombre:"Pesto casero",          icon:"🌿", tiempo:"10 min", porciones:"4", dificultad:"Fácil",   ingredientes:"5 ingredientes", disponible:false, porcentaje:60,  categoria:"Verdes",   faltanN:3 },
  // Pastas
  { id:2,  nombre:"Pasta al limón",        icon:"🍝", tiempo:"25 min", porciones:"2", dificultad:"Fácil",   ingredientes:"5 ingredientes", disponible:true,  porcentaje:100, categoria:"Pastas"    },
  { id:7,  nombre:"Wrap de pollo",         icon:"🌯", tiempo:"15 min", porciones:"2", dificultad:"Fácil",   ingredientes:"5 ingredientes", disponible:false, porcentaje:80,  categoria:"Pastas",   faltanN:1 },
  { id:10, nombre:"Pasta carbonara",       icon:"🍝", tiempo:"30 min", porciones:"2", dificultad:"Media",   ingredientes:"5 ingredientes", disponible:false, porcentaje:60,  categoria:"Pastas",   faltanN:2 },
  { id:15, nombre:"Pasta con ajo y aceite",icon:"🧄", tiempo:"20 min", porciones:"2", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:true,  porcentaje:100, categoria:"Pastas"    },
  { id:16, nombre:"Lasaña vegetal",        icon:"🫑", tiempo:"60 min", porciones:"6", dificultad:"Difícil", ingredientes:"8 ingredientes", disponible:false, porcentaje:50,  categoria:"Pastas",   faltanN:4 },
  // Desayunos
  { id:4,  nombre:"Tortilla española",     icon:"🍳", tiempo:"15 min", porciones:"4", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:true,  porcentaje:100, categoria:"Desayunos" },
  { id:11, nombre:"Tortitas de avena",     icon:"🥞", tiempo:"12 min", porciones:"2", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:true,  porcentaje:100, categoria:"Desayunos" },
  { id:17, nombre:"Tostadas de aguacate",  icon:"🥑", tiempo:"10 min", porciones:"2", dificultad:"Fácil",   ingredientes:"3 ingredientes", disponible:true,  porcentaje:100, categoria:"Desayunos" },
  { id:18, nombre:"Granola casera",        icon:"🌾", tiempo:"30 min", porciones:"6", dificultad:"Fácil",   ingredientes:"6 ingredientes", disponible:false, porcentaje:66,  categoria:"Desayunos",faltanN:2 },
  { id:19, nombre:"Smoothie de frutas",    icon:"🍓", tiempo:"5 min",  porciones:"2", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:false, porcentaje:75,  categoria:"Desayunos",faltanN:1 },
  // Sopas
  { id:5,  nombre:"Guiso de lentejas",     icon:"🫘", tiempo:"45 min", porciones:"4", dificultad:"Fácil",   ingredientes:"7 ingredientes", disponible:true,  porcentaje:100, categoria:"Sopas"     },
  { id:8,  nombre:"Ramen casero",          icon:"🍜", tiempo:"50 min", porciones:"2", dificultad:"Difícil", ingredientes:"8 ingredientes", disponible:false, porcentaje:62,  categoria:"Sopas",    faltanN:3 },
  { id:20, nombre:"Sopa de tomate",        icon:"🍅", tiempo:"25 min", porciones:"4", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:true,  porcentaje:100, categoria:"Sopas"     },
  { id:21, nombre:"Caldo de verduras",     icon:"🥕", tiempo:"30 min", porciones:"4", dificultad:"Fácil",   ingredientes:"5 ingredientes", disponible:true,  porcentaje:100, categoria:"Sopas"     },
  { id:22, nombre:"Crema de calabaza",     icon:"🎃", tiempo:"35 min", porciones:"4", dificultad:"Media",   ingredientes:"5 ingredientes", disponible:false, porcentaje:60,  categoria:"Sopas",    faltanN:2 },
  // Postres
  { id:12, nombre:"Flan de huevo",         icon:"🍮", tiempo:"40 min", porciones:"6", dificultad:"Media",   ingredientes:"3 ingredientes", disponible:true,  porcentaje:100, categoria:"Postres"   },
  { id:23, nombre:"Mousse de limón",       icon:"🍋", tiempo:"20 min", porciones:"4", dificultad:"Media",   ingredientes:"4 ingredientes", disponible:true,  porcentaje:100, categoria:"Postres"   },
  { id:24, nombre:"Brownie de chocolate",  icon:"🍫", tiempo:"35 min", porciones:"8", dificultad:"Media",   ingredientes:"6 ingredientes", disponible:false, porcentaje:66,  categoria:"Postres",  faltanN:2 },
  { id:25, nombre:"Tarta de manzana",      icon:"🍎", tiempo:"60 min", porciones:"8", dificultad:"Difícil", ingredientes:"7 ingredientes", disponible:false, porcentaje:57,  categoria:"Postres",  faltanN:3 },
  { id:26, nombre:"Arroz con leche",       icon:"🍚", tiempo:"30 min", porciones:"4", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:true,  porcentaje:100, categoria:"Postres"   },
  // Bebidas
  { id:27, nombre:"Limonada natural",      icon:"🍋", tiempo:"5 min",  porciones:"4", dificultad:"Fácil",   ingredientes:"3 ingredientes", disponible:true,  porcentaje:100, categoria:"Bebidas"   },
  { id:28, nombre:"Agua de pepino",        icon:"🥒", tiempo:"10 min", porciones:"4", dificultad:"Fácil",   ingredientes:"3 ingredientes", disponible:true,  porcentaje:100, categoria:"Bebidas"   },
  { id:29, nombre:"Smoothie verde",        icon:"🥦", tiempo:"5 min",  porciones:"2", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:false, porcentaje:75,  categoria:"Bebidas",  faltanN:1 },
  { id:30, nombre:"Té de jengibre",        icon:"🫚", tiempo:"10 min", porciones:"2", dificultad:"Fácil",   ingredientes:"3 ingredientes", disponible:true,  porcentaje:100, categoria:"Bebidas"   },
  { id:31, nombre:"Jugo de naranja",       icon:"🍊", tiempo:"5 min",  porciones:"2", dificultad:"Fácil",   ingredientes:"2 ingredientes", disponible:false, porcentaje:50,  categoria:"Bebidas",  faltanN:1 },
  { id:32, nombre:"Batido de plátano",     icon:"🍌", tiempo:"5 min",  porciones:"2", dificultad:"Fácil",   ingredientes:"3 ingredientes", disponible:false, porcentaje:66,  categoria:"Bebidas",  faltanN:1 },
];

export const categorias = [
  { nombre:"Disponibles", emoji:"🥗", count: recetas.filter(r => r.disponible).length },
  { nombre:"Verdes",      emoji:"🥦", count: recetas.filter(r => r.categoria === "Verdes").length },
  { nombre:"Pastas",      emoji:"🍝", count: recetas.filter(r => r.categoria === "Pastas").length },
  { nombre:"Desayunos",   emoji:"🍳", count: recetas.filter(r => r.categoria === "Desayunos").length },
  { nombre:"Sopas",       emoji:"🍲", count: recetas.filter(r => r.categoria === "Sopas").length },
  { nombre:"Postres",     emoji:"🍮", count: recetas.filter(r => r.categoria === "Postres").length },
  { nombre:"Bebidas",     emoji:"🧃", count: recetas.filter(r => r.categoria === "Bebidas").length },
];
