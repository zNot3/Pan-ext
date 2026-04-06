package com.panext.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.panext.app.data.*
import com.panext.app.ui.components.*
import com.panext.app.ui.theme.*

// ─── Status config ────────────────────────────────────────────────────────────
data class StatusConfig(val label: String, val bg: Color, val fg: Color)

fun alertConfig(alert: AlertType) = when (alert) {
    AlertType.EXPIRADO      -> StatusConfig("Expirado",      RedAlert.copy(alpha = 0.12f), RedAlert)
    AlertType.EXPIRA_HOY    -> StatusConfig("Expira hoy",    RedAlert.copy(alpha = 0.12f), RedAlert)
    AlertType.EXPIRA_PRONTO -> StatusConfig("Expira pronto", OrangeAlert.copy(alpha=0.12f), OrangeAlert)
    AlertType.BIEN          -> StatusConfig("Bien",          GreenSoft,                   GreenDark)
    AlertType.POCO          -> StatusConfig("Queda poco",    OrangeAlert.copy(alpha=0.12f), OrangeAlert)
}

// ─── Inventario Screen ────────────────────────────────────────────────────────
@Composable
fun InventarioScreen(navController: NavController) {
    var items by remember { mutableStateOf(AppData.inventario.map { it.copy() }.toMutableList()) }
    var showAddDialog   by remember { mutableStateOf(false) }
    var filterAlerts    by remember { mutableStateOf(false) }

    val alertCount = items.count { it.alert != AlertType.BIEN }
    val filtered   = if (filterAlerts) items.filter { it.alert != AlertType.BIEN } else items

    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.INVENTARIO) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Gray800,
                contentColor = White,
                shape = CircleShape,
                modifier = Modifier.padding(bottom = 8.dp)
            ) { Text("+", fontSize = 26.sp) }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
        ) {
            Spacer(Modifier.height(16.dp))
            Text("Inventario", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Gray800)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 2.dp, bottom = 16.dp)
            ) {
                Text("${items.size} elemento${if (items.size != 1) "s" else ""}", fontSize = 13.sp, color = Gray400)
                if (alertCount > 0) {
                    Text(
                        " · $alertCount alerta${if (alertCount != 1) "s" else ""}",
                        fontSize = 13.sp, color = RedAlert, fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Filter toggle
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 16.dp)) {
                FilterChip(selected = !filterAlerts, onClick = { filterAlerts = false }, label = { Text("Todos", fontSize = 13.sp) })
                FilterChip(selected = filterAlerts,  onClick = { filterAlerts = true  }, label = { Text("⚠️ Alertas", fontSize = 13.sp) })
            }

            if (filtered.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        if (filterAlerts) "No hay alertas activas" else "Tu inventario está vacío",
                        fontSize = 14.sp, color = Gray400
                    )
                }
            } else {
                PanExtCard {
                    filtered.forEachIndexed { i, item ->
                        if (i > 0) ItemDivider()
                        InventarioRow(
                            item = item,
                            onIncrement = {
                                val idx = items.indexOfFirst { it.id == item.id }
                                if (idx != -1) {
                                    items = items.toMutableList().also {
                                        it[idx] = it[idx].copy(qty = it[idx].qty + 1)
                                    }
                                    AppData.inventario.find { it.id == item.id }?.qty = items[idx].qty
                                }
                            },
                            onDecrement = {
                                val idx = items.indexOfFirst { it.id == item.id }
                                if (idx != -1 && items[idx].qty > 0) {
                                    items = items.toMutableList().also {
                                        it[idx] = it[idx].copy(qty = it[idx].qty - 1)
                                    }
                                    AppData.inventario.find { it.id == item.id }?.qty = items[idx].qty
                                }
                            },
                            onStatusChange = { newStatus ->
                                val idx = items.indexOfFirst { it.id == item.id }
                                if (idx != -1) {
                                    items = items.toMutableList().also {
                                        it[idx] = it[idx].copy(alertOverride = if (newStatus == AlertType.BIEN) null else newStatus)
                                    }
                                }
                            },
                            onTap = { navController.navigate(Routes.detalle(item.id)) }
                        )
                    }
                }
            }
            Spacer(Modifier.height(80.dp))
        }
    }

    if (showAddDialog) AddInventarioDialog(
        onAdd = { newItem ->
            items = items.toMutableList().also { it.add(newItem) }
            AppData.inventario.add(newItem)
        },
        onDismiss = { showAddDialog = false }
    )
}

// ─── Add dialog ───────────────────────────────────────────────────────────────
@Composable
fun AddInventarioDialog(onAdd: (InventarioItem) -> Unit, onDismiss: () -> Unit) {
    var name   by remember { mutableStateOf("") }
    var icon   by remember { mutableStateOf("🛒") }
    var expira by remember { mutableStateOf("") }
    var qty    by remember { mutableStateOf("1") }
    val dateError = expira.isNotBlank() && !isValidDate(expira)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nuevo elemento", fontWeight = FontWeight.SemiBold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("Nombre *") }, singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = icon, onValueChange = { icon = it },
                    label = { Text("Emoji (ej: 🍎)") }, singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = expira,
                    onValueChange = { expira = formatDateInput(it) },
                    label = { Text("Fecha expiración (dd/mm/aaaa)") },
                    singleLine = true,
                    isError = dateError,
                    supportingText = if (dateError) {{ Text("Fecha inválida", color = RedAlert, fontSize = 11.sp) }} else null,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = qty, onValueChange = { qty = it.filter { c -> c.isDigit() } },
                    label = { Text("Cantidad") }, singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    if (name.isNotBlank() && !dateError) {
                        onAdd(InventarioItem(
                            id = System.currentTimeMillis().toInt(),
                            name = name.trim(),
                            icon = icon.trim().ifEmpty { "🛒" },
                            expira = expira.trim().ifEmpty { "—" },
                            qty = qty.toIntOrNull() ?: 1
                        ))
                        onDismiss()
                    }
                }
            ) { Text("Agregar", color = GreenDark, fontWeight = FontWeight.SemiBold) }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}

// ─── Inventario row ───────────────────────────────────────────────────────────
@Composable
fun InventarioRow(
    item: InventarioItem,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
    onStatusChange: (AlertType) -> Unit,
    onTap: () -> Unit
) {
    var showStatusMenu by remember { mutableStateOf(false) }
    val cfg = alertConfig(item.alert)

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Gray100)
                .clickable { onTap() }
        ) { Text(item.icon, fontSize = 28.sp) }

        Spacer(Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f).clickable { onTap() }) {
            Text(item.name, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Gray800)
            Text("Expira: ${item.expira}", fontSize = 11.sp, color = Gray400, modifier = Modifier.padding(top = 1.dp))

            // Status badge — tappable to change
            Box {
                Box(
                    modifier = Modifier
                        .padding(top = 4.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(cfg.bg)
                        .clickable { showStatusMenu = true }
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("${cfg.label} ▾", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = cfg.fg)
                }

                DropdownMenu(
                    expanded = showStatusMenu,
                    onDismissRequest = { showStatusMenu = false }
                ) {
                    AlertType.values().forEach { type ->
                        val optCfg = alertConfig(type)
                        DropdownMenuItem(
                            text = {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(optCfg.fg))
                                    Text(optCfg.label, fontSize = 13.sp, color = optCfg.fg,
                                        fontWeight = if (item.alert == type) FontWeight.Bold else FontWeight.Normal)
                                    if (item.alert == type) {
                                        Spacer(Modifier.weight(1f))
                                        Text("✓", fontSize = 13.sp, color = GreenDark)
                                    }
                                }
                            },
                            onClick = {
                                onStatusChange(type)
                                showStatusMenu = false
                            }
                        )
                    }
                }
            }
        }

        // Qty controls
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            QtyButton(label = "−", filled = false) { onDecrement() }
            Text(
                item.qty.toString(), fontSize = 15.sp, fontWeight = FontWeight.SemiBold,
                color = Gray800, modifier = Modifier.widthIn(min = 20.dp), textAlign = TextAlign.Center
            )
            QtyButton(label = "+", filled = true) { onIncrement() }
        }
    }
}

@Composable
fun AlertChip(text: String, bg: Color, fg: Color) {
    Box(
        modifier = Modifier
            .padding(top = 3.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(bg)
            .padding(horizontal = 8.dp, vertical = 2.dp)
    ) { Text(text, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = fg) }
}

@Composable
fun QtyButton(label: String, filled: Boolean, onClick: () -> Unit) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .size(28.dp)
            .clip(CircleShape)
            .background(if (filled) Gray800 else White)
            .clickable { onClick() }
    ) {
        Text(label, fontSize = 18.sp, color = if (filled) White else Gray800, lineHeight = 18.sp)
    }
}

// ─── Detalle Screen ───────────────────────────────────────────────────────────
@Composable
fun DetalleScreen(navController: NavController, itemId: Int) {
    val item = AppData.inventario.find { it.id == itemId }

    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.INVENTARIO) }
    ) { padding ->
        if (item == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Ingrediente no encontrado")
            }
            return@Scaffold
        }

        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            BackHeader(title = item.name) { navController.popBackStack() }
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()).padding(horizontal = 20.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .fillMaxWidth().height(180.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Gray100).padding(bottom = 16.dp)
                ) { Text(item.icon, fontSize = 80.sp) }

                Spacer(Modifier.height(16.dp))

                PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
                    SectionLabel("📋 Información")
                    val cfg = alertConfig(item.alert)
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        InfoCell("CANTIDAD", item.qty.toString(), modifier = Modifier.weight(1f))
                        InfoCell("ESTADO", cfg.label, isGreen = item.alert == AlertType.BIEN, modifier = Modifier.weight(1f))
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("EXPIRA: ${item.expira}", fontSize = 11.sp, color = Gray400)
                    }
                }

                PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
                    SectionLabel("🍎 Información nutricional")
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        NutriCell("Calorías",  item.cal,  modifier = Modifier.weight(1f))
                        NutriCell("Proteínas", item.prot, modifier = Modifier.weight(1f))
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        NutriCell("Grasas",        item.gras, modifier = Modifier.weight(1f))
                        NutriCell("Carbohidratos", item.carb, modifier = Modifier.weight(1f))
                    }
                }
                Spacer(Modifier.height(20.dp))
            }
        }
    }
}

@Composable
fun InfoCell(label: String, value: String, isGreen: Boolean = false, modifier: Modifier = Modifier) {
    Box(modifier = modifier.clip(RoundedCornerShape(10.dp)).background(Gray100).padding(14.dp)) {
        Column {
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = Gray400, letterSpacing = 0.8.sp)
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = if (isGreen) GreenDark else Gray800, modifier = Modifier.padding(top = 4.dp))
        }
    }
}

@Composable
fun NutriCell(label: String, value: String, modifier: Modifier = Modifier) {
    Box(modifier = modifier.clip(RoundedCornerShape(10.dp)).background(Gray100).padding(12.dp)) {
        Column {
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = Gray400, letterSpacing = 0.8.sp)
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Gray800, modifier = Modifier.padding(top = 4.dp))
        }
    }
}
