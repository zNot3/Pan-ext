# Pan-Ext Web — Next.js + Tailwind + Firebase

---

## Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase
Copiá el archivo de ejemplo y llenalo con tus credenciales:
```bash
cp .env.local.example .env.local
```

Editá `.env.local` con los valores de tu proyecto Firebase:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pan-ext.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pan-ext
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pan-ext.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=8...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
```

### 3. Correr en desarrollo
```bash
npm run dev
```

Abrí http://localhost:3000 — te va a redirigir al login automáticamente.

---

## Estructura de Firestore

```
users/
  {uid}/                        ← documento del usuario (perfil + preferencias)
    inventario/
      {itemId}/                 ← InventarioDoc
    compras/
      {itemId}/                 ← CompraDoc
    notificaciones/
      {itemId}/                 ← NotificacionDoc
```

---

## Flujo de autenticación

1. Usuario accede a cualquier ruta → `AuthGuard` detecta si hay sesión
2. Sin sesión → redirige a `/login`
3. Login exitoso → redirige a `/` (dashboard)
4. Registro nuevo → crea perfil en Firestore + carga datos de ejemplo
5. Logout → vuelve a `/login`

---

## Páginas

| Página | Ruta | Backend |
|--------|------|---------|
| Login | `/login` | Firebase Auth |
| Registro | `/registro` | Firebase Auth + Firestore |
| Inicio | `/` | Firestore (inventario, compras, notifs) |
| Compras | `/compras` | Firestore CRUD |
| Recetas | `/recetas` | Datos estáticos (se migra en v2) |
| Receta IA | `/recetas/ia` | Respuestas simuladas |
| Inventario | `/inventario` | Firestore CRUD |
| Notificaciones | `/notificaciones` | Firestore |
| Perfil | `/perfil` | Firestore |

---

## ⚠️ Importante

- **Nunca** subas `.env.local` a un repositorio público
- Las reglas de Firestore están en modo **test** — configurá las reglas de seguridad antes de ir a producción
