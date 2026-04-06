"use client";
import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recetas } from "@/lib/data";

export default function RecetaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const receta = recetas.find(r => r.id === parseInt(id));

  if (!receta) return notFound();

  const tieneInstrucciones = receta.pasos.length > 0;

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link href="/recetas"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
        ← Volver a recetas
      </Link>

      {/* Header */}
      <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-8 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            {receta.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold text-gray-800">{receta.nombre}</h1>
                <p className="text-gray-400 mt-1">{receta.categoria}</p>
              </div>
              {receta.disponible
                ? <span className="text-xs font-semibold bg-green-soft text-green-dark px-3 py-1.5 rounded-full flex-shrink-0">✓ Disponible</span>
                : <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full flex-shrink-0">Faltan {receta.faltanN} ingrediente{receta.faltanN !== 1 ? "s" : ""}</span>
              }
            </div>

            {/* Meta */}
            <div className="flex items-center gap-6 mt-4">
              {[
                { icon:"⏱️", label:"Tiempo",     value: receta.tiempo     },
                { icon:"👥", label:"Porciones",  value: receta.porciones  },
                { icon:"📊", label:"Dificultad", value: receta.dificultad },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-lg">{m.icon}</span>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{m.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
          {[
            { label:"Calorías",     value: receta.cal  },
            { label:"Proteínas",    value: receta.prot },
            { label:"Grasas",       value: receta.gras },
            { label:"Carbohidratos",value: receta.carb },
          ].map(m => (
            <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-gray-800">{m.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Ingredientes */}
        <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6 h-fit">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            🧺 Ingredientes
          </h2>
          {receta.ingredientesList.length > 0 ? (
            <ul className="space-y-2.5">
              {receta.ingredientesList.map((ing, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-dark mt-1.5 flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Lista de ingredientes no disponible</p>
          )}
        </div>

        {/* Pasos */}
        <div className="col-span-2 bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            👨‍🍳 Instrucciones
          </h2>
          {tieneInstrucciones ? (
            <ol className="space-y-5">
              {receta.pasos.map(paso => (
                <li key={paso.numero} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-green-dark text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {paso.numero}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{paso.titulo}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{paso.descripcion}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <span className="text-4xl block mb-3">🔒</span>
              <p className="text-sm font-medium">Receta no disponible aún</p>
              <p className="text-xs mt-1">Te faltan {receta.faltanN} ingrediente{receta.faltanN !== 1 ? "s" : ""} para cocinar esta receta</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
