import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "Pan-Ext",
  description: "Gestión inteligente de tu despensa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-bg">
        <Sidebar />
        <TopBar />
        <main className="ml-56 pt-14 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
