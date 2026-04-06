package com.panext.app.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import com.panext.app.BuildConfig
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

private const val GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"

data class GeminiMessage(val role: String, val content: String)

object GeminiRepository {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    suspend fun chat(
        systemPrompt: String,
        messages: List<GeminiMessage>
    ): Result<String> = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isBlank()) {
            return@withContext Result.failure(Exception("GEMINI_API_KEY no configurada en local.properties"))
        }

        var lastError = ""
        repeat(3) { attempt ->
            try {
                val contentsArr = JSONArray()
                messages.forEach { msg ->
                    contentsArr.put(JSONObject().apply {
                        put("role", if (msg.role == "assistant") "model" else "user")
                        put("parts", JSONArray().put(JSONObject().put("text", msg.content)))
                    })
                }

                val body = JSONObject().apply {
                    put("system_instruction", JSONObject().put("parts",
                        JSONArray().put(JSONObject().put("text", systemPrompt))
                    ))
                    put("contents", contentsArr)
                    put("generationConfig", JSONObject().apply {
                        put("maxOutputTokens", 1000)
                        put("temperature", 0.7)
                    })
                }.toString()

                val request = Request.Builder()
                    .url("$GEMINI_URL?key=$apiKey")
                    .post(body.toRequestBody("application/json".toMediaType()))
                    .build()

                val response = client.newCall(request).execute()

                if (response.code == 429) {
                    lastError = "Límite de requests alcanzado. Esperá unos segundos."
                    Thread.sleep(2000L * (attempt + 1))
                    return@repeat
                }

                val responseBody = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errMsg = runCatching {
                        JSONObject(responseBody).getJSONObject("error").getString("message")
                    }.getOrDefault("Error ${response.code}")
                    return@withContext Result.failure(Exception(errMsg))
                }

                val text = JSONObject(responseBody)
                    .getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text")

                return@withContext Result.success(text)

            } catch (e: Exception) {
                lastError = e.message ?: "Error desconocido"
            }
        }
        Result.failure(Exception(lastError))
    }
}
