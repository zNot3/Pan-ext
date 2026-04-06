"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { seedUserData } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";

export default function RegistroPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [nombre,   setNombre]   = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Update display name
      await updateProfile(cred.user, { displayName: nombre });

      // 3. Create user profile document in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        nombre,
        email,
        notifExpiracion: true,
        sugerenciasIA:   true,
        modoOscuro:      false,
        resumenSemanal:  false,
        creadoEn:        serverTimestamp(),
      });

      // 4. Seed initial data (inventario, compras, notificaciones)
      await seedUserData(cred.user.uid);

      router.replace("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("Ya existe una cuenta con ese correo.");
      } else if (code === "auth/invalid-email") {
        setError("El correo no es válido.");
      } else if (code === "auth/weak-password") {
        setError("La contraseña es muy débil.");
      } else {
        setError("Ocurrió un error. Intentá de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🌿</span>
            <span className="font-display text-3xl font-bold text-gray-800">Pan-Ext</span>
          </div>
          <p className="text-gray-400">Creá tu cuenta gratuita</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">Crear cuenta</h1>

          {error && (
            <div className="bg-red/10 border border-red/20 text-red text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleRegistro} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                placeholder="Nombre Apellido"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-mid focus:ring-1 focus:ring-green-mid transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="usuario@correo.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-mid focus:ring-1 focus:ring-green-mid transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-mid focus:ring-1 focus:ring-green-mid transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="Repetí tu contraseña"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-mid focus:ring-1 focus:ring-green-mid transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-dark text-white font-semibold py-3 rounded-xl hover:bg-green-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-green-dark font-semibold hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
