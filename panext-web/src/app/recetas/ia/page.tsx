"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInventario, InventarioDoc } from "@/lib/firestore";

interface Message { id: number; text: string; isUser: boolean; loading?: boolean; }

const QUICK_IDEAS = [
  { label:"Sorpréndeme",              text:"Sorpréndeme con una receta con lo que tengo" },
  { label:"Desayuno saludable",       text:"Quiero un desayuno rápido y saludable" },
  { label:"Usar antes de que expiren",text:"¿Qué puedo cocinar con los ingredientes que están por expirar?" },
  { label:"Postre fácil",             text:"Quiero un postre fácil con ingredientes básicos" },
];

export default function RecetaIAPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "¡Hola! Soy tu asistente de cocina. Cuéntame qué ingredientes tenés o qué se te antoja y te creo una receta personalizada 🔍", isUser: false },
  ]);
  const [input, setInput]           = useState("");
  const [sending, setSending]       = useState(false);
  const [inventario, setInventario] = useState<InventarioDoc[]>([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getInventario(user.uid).then(data => {
      setInventario(data);
      setLoadingInv(false);
    });
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), text: msg, isUser: true };
    const loadingMsg: Message = { id: Date.now() + 1, text: "", isUser: false, loading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setSending(true);

    try {
      // Build context with user's inventory
      const inventarioCtx = inventario.length > 0
        ? `\nIngredientes disponibles en el inventario del usuario:\n${inventario.map(i => `- ${i.name} (cantidad: ${i.qty}, expira: ${i.expira})`).join("\n")}\n`
        : "";

      // Build conversation history for Claude
      const historial = messages
        .filter(m => !m.loading)
        .map(m => ({
          role: m.isUser ? "user" as const : "assistant" as const,
          content: m.text,
        }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Sos un asistente de cocina amigable y creativo para la app Pan-Ext, una app de gestión de despensa.
Tu objetivo es ayudar a los usuarios a crear recetas personalizadas basadas en sus ingredientes disponibles.
${inventarioCtx}
Reglas:
- Respondé siempre en español
- Sé conciso pero completo (máximo 200 palabras por respuesta)
- Si el usuario pide una receta, incluí: nombre, tiempo estimado, ingredientes necesarios y pasos resumidos
- Si faltan ingredientes del inventario, mencionalo brevemente
- Sé entusiasta y motivador
- No inventes ingredientes que no existen
- Si el usuario saluda o hace preguntas generales, respondé naturalmente antes de ofrecer ayuda con recetas`,
          messages: [
            ...historial,
            { role: "user" as const, content: msg },
          ],
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text ?? "Lo siento, no pude generar una respuesta. Intentá de nuevo.";

      setMessages(prev => prev.map(m =>
        m.loading ? { ...m, text: reply, loading: false } : m
      ));
    } catch {
      setMessages(prev => prev.map(m =>
        m.loading ? { ...m, text: "Hubo un error al conectar con la IA. Verificá tu conexión e intentá de nuevo.", loading: false } : m
      ));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-56px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="font-display text-3xl font-bold text-gray-800">Receta con IA ✨</h1>
        <p className="text-gray-400 mt-1">Powered by Claude — tu chef virtual personalizado</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3D1F6D] to-purple-500 rounded-xl flex items-center justify-center text-lg">✨</div>
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
                  {msg.loading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}} />
                    </span>
                  ) : msg.text}
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
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Escribe tus ingredientes o una idea…"
              disabled={sending}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid disabled:opacity-60"
            />
            <button onClick={() => sendMessage()}
              disabled={sending || !input.trim()}
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
              ▶
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-4 flex-shrink-0">
          {/* Inventario disponible */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              🧺 Tu inventario
            </p>
            {loadingInv ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : inventario.length === 0 ? (
              <p className="text-xs text-gray-400">Tu inventario está vacío. Agrega productos primero.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {inventario.map(item => (
                  <button key={item.id}
                    onClick={() => sendMessage(`Tengo ${item.name} y quiero una receta`)}
                    className="text-xs bg-gray-100 hover:bg-green-soft hover:text-green-dark text-gray-700 px-2.5 py-1 rounded-full transition-colors">
                    {item.icon} {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ideas rápidas */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              💡 Ideas rápidas
            </p>
            <div className="space-y-1.5">
              {QUICK_IDEAS.map(idea => (
                <button key={idea.label}
                  onClick={() => sendMessage(idea.text)}
                  disabled={sending}
                  className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-green-soft hover:text-green-dark px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
                  {idea.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
