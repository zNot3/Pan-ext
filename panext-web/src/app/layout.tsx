import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

export const metadata: Metadata = {
  title: "Pan-Ext",
  description: "Gestión inteligente de tu despensa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-bg">
        <AuthProvider>
          <ProtectedLayout>
            {children}
          </ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
