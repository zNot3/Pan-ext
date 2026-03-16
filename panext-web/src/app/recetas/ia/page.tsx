"use client";
import { useState, useRef, useEffect } from "react";
import { inventario } from "@/lib/data";

interface Message { id: number; text: string; isUser: boolean; }

const REPLIES = [
  "¡Perfecto combo! Te propongo un **Pollo al limón con ajo confitado** — listo en 25 min y lleno de sabor. Ingredientes: pechuga de pollo, 3 dientes de ajo, 1 limón, aceite de oliva, sal y pimienta.\n\n**Pasos:**\n1. Sazona el pollo con sal, pimienta y ralladura de limón.\n2. Confita el ajo en aceite a fuego bajo 5 min.\n3. Sella el pollo 6 min por lado en el mismo aceite.\n4. Exprime el limón sobre el pollo al final. ¡Listo!",
  "¡Excelente elección! Con esos ingredientes te preparo algo delicioso en menos de 30 minutos. ¿Prefieres algo más ligero o contundente?",
  "¡Me encanta! Voy a crear una receta especial basada en tus ingredientes y preferencias. Un momento... ✨",
  "Con eso puedo hacer algo increíble. Te recomiendo empezar con los ingredientes más frescos primero para aprovecharlos al máximo. 🥗",
];

const QUICK_IDEAS = ["Sorpréndeme", "Desayuno saludable", "Usar antes de que expiren", "Postre fácil"];

export default function RecetaIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "¡Hola! Soy tu asistente de cocina. Cuéntame qué ingredientes tienes o qué se te antoja y creo una receta personalizada para ti 🔍", isUser: false },
    { id: 1, text: "Tengo pollo, limón y ajo. Quiero algo rápido y saludable.", isUser: true },
    { id: 2, text: REPLIES[0], isUser: false },
  ]);
  const [input, setInput]   = useState("");
  const [replyIdx, setReplyIdx] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput("");
    const userMsg: Message = { id: Date.now(), text: msg, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        text: REPLIES[replyIdx % REPLIES.length],
        isUser: false
      };
      setMessages(prev => [...prev, reply]);
      setReplyIdx(i => i + 1);
    }, 700);
  };

  return (
    <div className="p-8 h-[calc(100vh-56px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="font-display text-3xl font-bold text-gray-800">Receta con IA ✨</h1>
        <p className="text-gray-400 mt-1">Dinos tu idea y creamos algo delicioso</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-xl2 shadow-card overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-dark to-purple-600 rounded-xl flex items-center justify-center text-lg">✨</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Asistente de Recetas</p>
              <p className="text-xs text-gray-400">Con IA · Responde al instante</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-dark font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-dark inline-block animate-pulse" />
              En línea
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.isUser
                    ? "bg-gray-800 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Escribe tus ingredientes o una idea…"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
            />
            <button onClick={() => send()}
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors flex-shrink-0">
              ▶
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-4 flex-shrink-0">
          {/* Ingredientes disponibles */}
          <div className="bg-white rounded-xl2 shadow-card p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              🧺 Ingredientes disponibles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {inventario.slice(0, 8).map(item => (
                <button key={item.id}
                  onClick={() => send(item.name)}
                  className="text-xs bg-gray-100 hover:bg-green-soft hover:text-green-dark text-gray-700 px-2.5 py-1 rounded-full transition-colors">
                  {item.icon} {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ideas rápidas */}
          <div className="bg-white rounded-xl2 shadow-card p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              💡 Ideas rápidas
            </p>
            <div className="space-y-1.5">
              {QUICK_IDEAS.map(idea => (
                <button key={idea} onClick={() => send(idea)}
                  className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-green-soft hover:text-green-dark px-3 py-2 rounded-xl transition-colors">
                  {idea === "Sorpréndeme" ? "⚡" :
                   idea === "Desayuno saludable" ? "🌅" :
                   idea === "Usar antes de que expiren" ? "⚠️" : "🍰"} {idea}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
