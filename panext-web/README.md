# Pan-Ext Web — Next.js + Tailwind + Firebase + Gemini

---

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Editá .env.local con tus credenciales

# 3. Correr en desarrollo
npm run dev
```

---

## Variables de entorno requeridas

### Firebase (console.firebase.google.com)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Gemini AI (aistudio.google.com/app/apikey)
```
GEMINI_API_KEY=
```

---

## Servicios Firebase requeridos

En la consola de Firebase activá:
1. **Authentication** → Email/Password + Google
2. **Firestore Database** → crear en modo test
3. **Storage** → crear en modo test (para foto de perfil)

Para Google Auth también tenés que agregar tu dominio en:
Authentication → Settings → Authorized domains → agregar `localhost`

---

## Estructura de datos (Firestore)

```
users/
  {uid}/                    ← perfil + preferencias del usuario
    inventario/{id}         ← productos con qty, expira, alert
    compras/{id}            ← items de la lista de compras
    notificaciones/{id}     ← generadas automáticamente desde inventario
```

---

## Páginas

| Página | Ruta | Descripción |
|--------|------|-------------|
| Login | `/login` | Email/pass + Google |
| Registro | `/registro` | Crea cuenta nueva |
| Inicio | `/` | Dashboard con stats |
| Compras | `/compras` | Lista interactiva → agrega al inventario al marcar |
| Recetas | `/recetas` | Catálogo con filtros |
| Detalle receta | `/recetas/[id]` | Ingredientes, pasos, macros |
| Receta con IA | `/recetas/ia` | Chat con Gemini + contexto de inventario |
| Inventario | `/inventario` | CRUD con edición inline de fechas |
| Notificaciones | `/notificaciones` | Auto-generadas desde inventario |
| Perfil | `/perfil` | Preferencias + foto de perfil |
