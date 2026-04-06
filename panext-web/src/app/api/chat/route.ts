import { NextRequest, NextResponse } from "next/server";

// gemini-2.0-flash-lite: recommended model for new users
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada en el servidor." },
        { status: 500 }
      );
    }

    const contents = messages.map(
      (m: { role: "user" | "assistant"; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })
    );

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
    };

    // Retry up to 3 times on 429 with exponential backoff
    let geminiRes: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (geminiRes.status !== 429) break;

      const wait = 2000 * Math.pow(2, attempt);
      console.warn(`Gemini 429 — reintentando en ${wait}ms (intento ${attempt + 1}/3)`);
      await sleep(wait);
    }

    if (!geminiRes!.ok) {
      const errData = await geminiRes!.json();
      console.error("Gemini API error:", errData);
      const isQuota = geminiRes!.status === 429;
      return NextResponse.json(
        {
          error: isQuota
            ? "Límite de requests de Gemini alcanzado. Esperá unos segundos e intentá de nuevo."
            : "Error al comunicarse con Gemini.",
          detail: errData,
        },
        { status: geminiRes!.status }
      );
    }

    const data = await geminiRes!.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Lo siento, no pude generar una respuesta. Intentá de nuevo.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Error en /api/chat:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
