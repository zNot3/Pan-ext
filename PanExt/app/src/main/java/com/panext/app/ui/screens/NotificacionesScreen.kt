package com.panext.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
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
import com.panext.app.data.Notificacion
import com.panext.app.data.NotifGenerator
import com.panext.app.data.NotifTipo
import com.panext.app.data.Routes
import com.panext.app.ui.components.*
import com.panext.app.ui.theme.*

@Composable
fun NotificacionesScreen(navController: NavController) {
    // Generate notifications fresh from current inventario state
    var notifs by remember {
        mutableStateOf(NotifGenerator.generate(AppData.inventario).toMutableList())
    }

    val urgentes    = notifs.filter { it.tipo == NotifTipo.URGENTE }
    val avisos      = notifs.filter { it.tipo == NotifTipo.AVISO || it.tipo == NotifTipo.IA }
    val informacion = notifs.filter { it.tipo == NotifTipo.INFO || it.tipo == NotifTipo.SISTEMA }
    val unread      = notifs.count { !it.leida }

    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.NOTIFICACIONES) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Header with mark-all button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Notificaciones", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Gray800)
                    if (unread > 0) {
                        Text("$unread nueva${if (unread != 1) "s" else ""}", fontSize = 12.sp, color = OrangeAlert)
                    } else {
                        Text("Basadas en tu inventario actual", fontSize = 12.sp, color = Gray400)
                    }
                }
                if (unread > 0) {
                    TextButton(onClick = {
                        notifs = notifs.map { it.copy(leida = true) }.toMutableList()
                    }) {
                        Text("✓ Marcar todas", fontSize = 12.sp, color = GreenDark)
                    }
                }
            }

            Column(
                modifier = Modifier
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp)
            ) {
                if (notifs.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 60.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🔔", fontSize = 48.sp)
                            Text("Todo en orden", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Gray400, modifier = Modifier.padding(top = 8.dp))
                            Text("No hay alertas en tu inventario", fontSize = 13.sp, color = Gray400)
                        }
                    }
                } else {
                    NotifSection("🔴 Urgentes", urgentes) { notif ->
                        notifs = notifs.map {
                            if (it === notif) it.copy(leida = true) else it
                        }.toMutableList()
                    }
                    NotifSection("🟡 Avisos", avisos) { notif ->
                        notifs = notifs.map {
                            if (it === notif) it.copy(leida = true) else it
                        }.toMutableList()
                    }
                    NotifSection("🟢 Información", informacion) { notif ->
                        notifs = notifs.map {
                            if (it === notif) it.copy(leida = true) else it
                        }.toMutableList()
                    }
                }
                Spacer(Modifier.height(20.dp))
            }
        }
    }
}

@Composable
fun NotifSection(title: String, items: List<Notificacion>, onMark: (Notificacion) -> Unit) {
    if (items.isEmpty()) return
    PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
        SectionLabel(title)
        items.forEachIndexed { i, notif ->
            if (i > 0) ItemDivider()
            NotifRow(notif) { onMark(notif) }
        }
    }
}

@Composable
fun NotifRow(notif: Notificacion, onClick: () -> Unit) {
    val (badgeText, badgeBg, badgeFg) = when (notif.tipo) {
        NotifTipo.URGENTE -> Triple("Urgente", Color(0xFFFDECEA), RedAlert)
        NotifTipo.AVISO   -> Triple("Aviso",   Color(0xFFFEF3E2), OrangeAlert)
        NotifTipo.INFO    -> Triple("Info",    Gray100, Gray600)
        NotifTipo.IA      -> Triple("IA",      Color(0xFFEEF0FF), Color(0xFF5C6BC0))
        NotifTipo.SISTEMA -> Triple("Sistema", Gray100, Gray600)
    }
    val dotColor = when {
        notif.leida -> Gray200
        notif.tipo == NotifTipo.URGENTE -> RedAlert
        notif.tipo == NotifTipo.AVISO   -> OrangeAlert
        else -> GreenDark
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 14.dp)
            .then(if (notif.leida) Modifier else Modifier),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp).clip(CircleShape).background(dotColor)
                .align(Alignment.Top).padding(top = 6.dp)
        )
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    notif.titulo, fontSize = 14.sp, fontWeight = FontWeight.SemiBold,
                    color = if (notif.leida) Gray400 else Gray800
                )
                Badge(badgeText, badgeBg, badgeFg)
            }
            Spacer(Modifier.height(2.dp))
            Text(notif.descripcion, fontSize = 13.sp, color = Gray400)
            Text(notif.tiempo, fontSize = 11.sp, color = Gray400, modifier = Modifier.padding(top = 4.dp))
        }
        if (!notif.leida) {
            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(GreenDark).align(Alignment.CenterVertically))
        }
    }
}
