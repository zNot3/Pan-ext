# Pan-Ext Web — Next.js + Tailwind CSS

Versión web de Pan-Ext. Gestión inteligente de despensa.

---

## Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js     | 18+     |
| npm / yarn  | cualquiera |

---

## Cómo correr el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en desarrollo
npm run dev

# 3. Abrir en el navegador
http://localhost:3000
```

---

## Estructura

```
src/
├── app/
│   ├── layout.tsx               ← Root layout (Sidebar + TopBar)
│   ├── page.tsx                 ← Inicio / Dashboard
│   ├── compras/page.tsx         ← Lista de Compras interactiva
│   ├── recetas/
│   │   ├── page.tsx             ← Recetas con filtro por categoría
│   │   └── ia/page.tsx          ← Chat con IA
│   ├── inventario/page.tsx      ← Inventario con +/- y modal
│   ├── notificaciones/page.tsx
│   └── perfil/page.tsx
├── components/
│   └── layout/
│       ├── Sidebar.tsx
│       └── TopBar.tsx
└── lib/
    └── data.ts                  ← Todos los datos estáticos
```

---

## Páginas implementadas

| Página | Ruta | Interactividad |
|--------|------|----------------|
| Inicio | `/` | Stats, notificaciones, recetas disponibles |
| Compras | `/compras` | ✅ Check/uncheck, eliminar, agregar IA, modal, barra de progreso |
| Recetas | `/recetas` | ✅ Filtro por categoría |
| Receta con IA | `/recetas/ia` | ✅ Chat funcional, ingredientes disponibles, ideas rápidas |
| Inventario | `/inventario` | ✅ +/- cantidades, filtros, modal nuevo item |
| Notificaciones | `/notificaciones` | ✅ Marcar como leídas |
| Perfil | `/perfil` | ✅ Toggles de preferencias |
