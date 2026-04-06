package com.panext.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.panext.app.data.AppData
import com.panext.app.data.ChatMensaje
import com.panext.app.data.GeminiMessage
import com.panext.app.data.GeminiRepository
import com.panext.app.data.Routes
import com.panext.app.ui.components.BackHeader
import com.panext.app.ui.components.PanExtBottomNav
import com.panext.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun ChatIAScreen(navController: NavController) {
    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMensaje(
                    "¡Hola! Soy tu asistente de cocina. Cuéntame qué se te antoja y te creo una receta con lo que tenés en tu inventario 🔍",
                    esUsuario = false
                )
            )
        )
    }
    var input    by remember { mutableStateOf("") }
    var sending  by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()
    val scope     = rememberCoroutineScope()

    // Build system prompt
    val systemPrompt = """
Sos un asistente de cocina amigable y creativo para la app Pan-Ext, una app de gestión de despensa.
Tu objetivo es ayudar a los usuarios a crear recetas personalizadas basadas en sus ingredientes disponibles.
Reglas:
- Respondé siempre en español
- Sé conciso pero completo (máximo 200 palabras por respuesta)
- Si el usuario pide una receta, incluí: nombre, tiempo estimado, ingredientes necesarios y pasos resumidos
- Si faltan ingredientes del inventario, mencionalo brevemente
- Sé entusiasta y motivador
- No inventes ingredientes que no existen
- Si el usuario saluda o hace preguntas generales, respondé naturalmente antes de ofrecer ayuda con recetas
    """.trimIndent()

    // Hidden inventory context injected as first user turn
    val inventarioPrompt = if (AppData.inventario.isNotEmpty()) {
        "[Contexto del sistema — no mencionar al usuario directamente]\n" +
        "Inventario actual del usuario:\n" +
        AppData.inventario.joinToString("\n") { "- ${it.name} (cantidad: ${it.qty}, expira: ${it.expira})" } +
        "\nUsá esta información para sugerir recetas con ingredientes disponibles."
    } else {
        "[Contexto del sistema] El usuario no tiene productos en su inventario todavía."
    }

    val sendMessage: (String) -> Unit = { text ->
        val msg = text.trim()
        if (msg.isNotBlank() && !sending) {
            sending = true
            // Add user message + loading bubble
            messages = messages + listOf(
                ChatMensaje(msg, esUsuario = true),
                ChatMensaje("", esUsuario = false, loading = true)
            )
            scope.launch {
                listState.animateScrollToItem(messages.size - 1)

                // Build history for Gemini — hidden turns first, then visible history
                val hiddenTurns = listOf(
                    GeminiMessage("user", inventarioPrompt),
                    GeminiMessage("assistant", "Entendido, ya tengo el inventario cargado. Estoy listo para ayudarte con recetas.")
                )
                // Visible history: skip the first AI greeting (assistant turn)
                val visibleHistory = messages
                    .filter { !it.loading }
                    .drop(1) // drop initial greeting
                    .dropLast(1) // drop the user msg we just added (we send it separately)
                    .map { m ->
                        GeminiMessage(if (m.esUsuario) "user" else "assistant", m.texto)
                    }

                val allMessages = hiddenTurns + visibleHistory + GeminiMessage("user", msg)

                val result = GeminiRepository.chat(systemPrompt, allMessages)

                val reply = result.getOrElse { e ->
                    "Error de la IA: ${e.message}"
                }

                messages = messages.dropLast(1) + ChatMensaje(reply, esUsuario = false)
                sending = false
                listState.animateScrollToItem(messages.size - 1)
            }
        }
    }

    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.CHAT_IA) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            BackHeader(title = "✨ Receta con IA") { navController.popBackStack() }
            HorizontalDivider(color = Gray100)

            // Messages
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                items(messages) { msg ->
                    ChatBubble(msg)
                }
            }

            HorizontalDivider(color = Gray100)

            // Input row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = input,
                    onValueChange = { input = it },
                    placeholder = { Text("Escribe tu idea o ingredientes…", fontSize = 14.sp) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(24.dp),
                    singleLine = true,
                    enabled = !sending,
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor  = Gray200,
                        focusedBorderColor    = GreenDark,
                        unfocusedContainerColor = Gray100,
                        focusedContainerColor = Gray100,
                        disabledContainerColor = Gray100,
                        disabledBorderColor = Gray200
                    )
                )
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(if (sending || input.isBlank()) Gray200 else Gray800)
                ) {
                    IconButton(
                        onClick = {
                            val text = input.trim()
                            input = ""
                            sendMessage(text)
                        },
                        enabled = !sending && input.isNotBlank()
                    ) {
                        Text("▶", fontSize = 16.sp, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun ChatBubble(msg: ChatMensaje) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (msg.esUsuario) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(
                    if (msg.esUsuario)
                        RoundedCornerShape(18.dp, 4.dp, 18.dp, 18.dp)
                    else
                        RoundedCornerShape(4.dp, 18.dp, 18.dp, 18.dp)
                )
                .background(if (msg.esUsuario) Gray800 else Color.White)
                .padding(12.dp, 10.dp)
        ) {
            if (msg.loading) {
                // Animated dots
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    repeat(3) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(Gray400)
                        )
                    }
                }
            } else {
                Text(
                    text = msg.texto,
                    fontSize = 14.sp,
                    color = if (msg.esUsuario) Color.White else Gray800,
                    lineHeight = 20.sp,
                    fontWeight = FontWeight.Normal
                )
            }
        }
    }
}
