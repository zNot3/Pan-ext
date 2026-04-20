package com.panext.app.data

import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.BlockThreshold
import com.google.ai.client.generativeai.type.HarmCategory
import com.google.ai.client.generativeai.type.SafetySetting
import com.google.ai.client.generativeai.type.content
import com.google.ai.client.generativeai.type.generationConfig
import com.panext.app.BuildConfig

data class GeminiMessage(val role: String, val content: String)

object GeminiRepository {

    private fun buildModel(systemPrompt: String): GenerativeModel {
        return GenerativeModel(
            modelName = "gemini-2.5-flash-lite-preview-06-17",
            apiKey = BuildConfig.GEMINI_API_KEY,
            generationConfig = generationConfig {
                temperature = 0.7f
                maxOutputTokens = 1000
            },
            safetySettings = listOf(
                SafetySetting(HarmCategory.HARASSMENT, BlockThreshold.MEDIUM_AND_ABOVE),
                SafetySetting(HarmCategory.HATE_SPEECH, BlockThreshold.MEDIUM_AND_ABOVE),
            ),
            systemInstruction = content { text(systemPrompt) }
        )
    }

    suspend fun chat(
        systemPrompt: String,
        messages: List<GeminiMessage>
    ): Result<String> {
        return try {
            val model = buildModel(systemPrompt)

            // Build history for the chat session (all messages except the last user one)
            val history = messages.dropLast(1).map { msg ->
                content(role = if (msg.role == "assistant") "model" else "user") {
                    text(msg.content)
                }
            }

            // Start chat session with history
            val chat = model.startChat(history)

            // Send the last user message
            val lastMessage = messages.last().content
            val response = chat.sendMessage(lastMessage)

            val reply = response.text
                ?: return Result.failure(Exception("La IA no devolvió una respuesta. Intentá de nuevo."))

            Result.success(reply)

        } catch (e: Exception) {
            val msg = when {
                e.message?.contains("API_KEY") == true       -> "API key inválida. Verificá tu GEMINI_API_KEY."
                e.message?.contains("quota") == true         -> "Límite de requests alcanzado. Esperá unos segundos."
                e.message?.contains("PERMISSION_DENIED") == true -> "Sin permiso. Verificá que la API key tenga acceso a Gemini."
                else -> e.message ?: "Error desconocido al contactar Gemini."
            }
            Result.failure(Exception(msg))
        }
    }
}
