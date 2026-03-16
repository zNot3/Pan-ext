"use client";
import { useState } from "react";
import Link from "next/link";
import { recetas, categorias, RecetaItem } from "@/lib/data";

export default function RecetasPage() {
  const [selectedCat, setSelectedCat] = useState("Disponibles");
  const filtered = selectedCat === "Disponibles"
    ? recetas.filter(r => r.disponible)
    : recetas.filter(r => r.categoria === selectedCat);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Recetas</h1>
        <p className="text-gray-400 mt-1">Explora o genera con IA</p>
      </div>
      <div className="bg-gradient-to-r from-[#3D1F6D] to-[#6A3EA1] rounded-[16px] p-5 flex items-center gap-4 mb-6">
        <span className="text-3xl">✨</span>
        <div className="flex-1">
          <p className="font-bold text-white text-lg">¿Tienes una idea? ¡Démosle vida!</p>
          <p className="text-purple-200 text-sm mt-0.5">Cuéntale a la IA tus ingredientes o antojos y crea una receta personalizada al instante</p>
        </div>
        <Link href="/recetas/ia" className="bg-white text-[#3D1F6D] font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0">
          Generar con IA →
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-4 h-fit">
          <p className="text-[10px] font-semibold text-[#9E9891] uppercase tracking-widest px-2 mb-3">📂 Categorías</p>
          <ul className="space-y-0.5">
            {categorias.map(cat => (
              <li key={cat.nombre}>
                <button onClick={() => setSelectedCat(cat.nombre)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCat === cat.nombre ? "bg-[#D8F3DC] text-[#2D6A4F] font-semibold" : "text-[#6B6560] hover:bg-[#F0EDEA]"
                  }`}>
                  <span className="flex items-center gap-2"><span>{cat.emoji}</span><span>{cat.nombre}</span></span>
                  <span className="text-[10px] text-[#9E9891]">{cat.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <p className="text-sm font-semibold text-[#2E2B28] mb-4">
            {categorias.find(c => c.nombre === selectedCat)?.emoji} {selectedCat}
            <span className="text-[#9E9891] font-normal ml-2">{filtered.length} recetas</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(r => <RecetaCard key={r.id} receta={r} />)}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-12 text-[#9E9891]">
                <span className="text-4xl block mb-3">🍽️</span>
                <p className="text-sm">No hay recetas en esta categoría</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecetaCard({ receta }: { receta: RecetaItem }) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)] transition-shadow cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 bg-[#F0EDEA] rounded-xl flex items-center justify-center text-3xl flex-shrink-0">{receta.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#2E2B28] text-sm leading-tight">{receta.nombre}</h3>
          <p className="text-xs text-[#9E9891] mt-1">{receta.tiempo} · {receta.dificultad} · {receta.porciones} porciones</p>
          <div className="mt-2">
            {receta.disponible
              ? <span className="text-[10px] font-semibold bg-[#D8F3DC] text-[#2D6A4F] px-2 py-0.5 rounded-full">✓ Disponible</span>
              : <span className="text-[10px] font-semibold bg-[#F0EDEA] text-[#6B6560] px-2 py-0.5 rounded-full">Faltan {receta.faltanN} ingrediente{receta.faltanN !== 1 ? "s" : ""}</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
