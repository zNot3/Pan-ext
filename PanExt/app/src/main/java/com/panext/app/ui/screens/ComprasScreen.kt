package com.panext.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.panext.app.data.*
import com.panext.app.ui.components.*
import com.panext.app.ui.theme.*

private val UNIDADES = listOf("und", "g", "kg", "ml", "L", "taza", "tbsp", "tsp", "paq", "caja")

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ComprasScreen(navController: NavController) {
    var items       by remember { mutableStateOf(AppData.compras.toMutableList()) }
    var suggestions by remember { mutableStateOf(AppData.sugerenciasIA.toMutableList()) }
    var showAddDialog by remember { mutableStateOf(false) }
    // Item pending confirmation (marking as bought → expiry modal)
    var pendingCheck  by remember { mutableStateOf<CompraItem?>(null) }

    val completed = items.count { it.checked }
    val pending   = items.count { !it.checked }

    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.COMPRAS) },
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
            Text("Lista de Compras", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Gray800)
            Text(
                "$completed completado${if (completed != 1) "s" else ""} · $pending pendiente${if (pending != 1) "s" else ""}",
                fontSize = 13.sp, color = Gray400,
                modifier = Modifier.padding(top = 2.dp, bottom = 16.dp)
            )

            PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
                SectionLabel("🛒 Lista")
                items.forEachIndexed { i, item ->
                    if (i > 0) ItemDivider()
                    CompraRow(
                        item = item,
                        onToggle = {
                            if (item.checked) {
                                // Uncheck directly
                                items = items.toMutableList().also { list ->
                                    val idx = list.indexOfFirst { it.id == item.id }
                                    if (idx != -1) list[idx] = list[idx].copy(checked = false)
                                }
                            } else {
                                // Show expiry modal
                                pendingCheck = item
                            }
                        },
                        onDelete = {
                            items = items.toMutableList().also { list ->
                                list.removeIf { it.id == item.id }
                            }
                            AppData.compras.clear(); AppData.compras.addAll(items)
                        }
                    )
                }
            }

            if (suggestions.isNotEmpty()) {
                PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
                    SectionLabel("✨ Sugerencias IA")
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        suggestions.forEach { sug ->
                            SuggestionChip(text = sug) {
                                items = items.toMutableList().also { list ->
                                    list.add(CompraItem(System.currentTimeMillis().toInt(), sug, "x1", fromIA = true))
                                }
                                suggestions = suggestions.toMutableList().also { it.remove(sug) }
                                AppData.compras.clear(); AppData.compras.addAll(items)
                                AppData.sugerenciasIA.clear(); AppData.sugerenciasIA.addAll(suggestions)
                            }
                        }
                    }
                }
            }
            Spacer(Modifier.height(80.dp))
        }
    }

    // ── Add item dialog ──
    if (showAddDialog) {
        AddCompraDialog(
            onAdd = { name, qty ->
                items = items.toMutableList().also {
                    it.add(CompraItem(System.currentTimeMillis().toInt(), name, qty))
                }
                AppData.compras.clear(); AppData.compras.addAll(items)
            },
            onDismiss = { showAddDialog = false }
        )
    }

    // ── Expiry modal when marking as bought ──
    pendingCheck?.let { item ->
        ExpiraCompraDialog(
            item = item,
            onConfirm = { expira ->
                // Mark checked
                items = items.toMutableList().also { list ->
                    val idx = list.indexOfFirst { it.id == item.id }
                    if (idx != -1) list[idx] = list[idx].copy(checked = true)
                }
                AppData.compras.clear(); AppData.compras.addAll(items)

                // Parse qty number from string like "400 ml" or "x2"
                val qtyNum = item.qty.filter { it.isDigit() || it == '.' }
                    .toDoubleOrNull()?.toInt() ?: 1

                // Add to inventario
                AppData.inventario.add(InventarioItem(
                    id     = System.currentTimeMillis().toInt(),
                    name   = item.name,
                    icon   = "🛒",
                    expira = expira.ifBlank { "—" },
                    qty    = qtyNum
                ))
                pendingCheck = null
            },
            onDismiss = { pendingCheck = null }
        )
    }
}

// ─── Add compra dialog (name + qty + unit) ────────────────────────────────────
@Composable
fun AddCompraDialog(onAdd: (String, String) -> Unit, onDismiss: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var qty  by remember { mutableStateOf("1") }
    var unit by remember { mutableStateOf("und") }
    var showUnitMenu by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nuevo elemento", fontWeight = FontWeight.SemiBold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("Producto") }, singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = qty,
                        onValueChange = { qty = it.filter { c -> c.isDigit() || c == '.' } },
                        label = { Text("Cantidad") }, singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f)
                    )
                    Box(modifier = Modifier.weight(1f)) {
                        OutlinedTextField(
                            value = unit, onValueChange = {},
                            label = { Text("Unidad") }, singleLine = true,
                            readOnly = true,
                            modifier = Modifier.fillMaxWidth().clickable { showUnitMenu = true }
                        )
                        DropdownMenu(expanded = showUnitMenu, onDismissRequest = { showUnitMenu = false }) {
                            UNIDADES.forEach { u ->
                                DropdownMenuItem(
                                    text = { Text(u) },
                                    onClick = { unit = u; showUnitMenu = false }
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = {
                if (name.isNotBlank()) {
                    val qtyStr = if (unit == "und") "x${qty.toDoubleOrNull()?.toInt() ?: 1}" else "${qty} $unit"
                    onAdd(name.trim(), qtyStr)
                    onDismiss()
                }
            }) { Text("Agregar", color = GreenDark, fontWeight = FontWeight.SemiBold) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } }
    )
}

// ─── Expiry modal ─────────────────────────────────────────────────────────────
@Composable
fun ExpiraCompraDialog(item: CompraItem, onConfirm: (String) -> Unit, onDismiss: () -> Unit) {
    var expira    by remember { mutableStateOf("") }
    val dateError = expira.isNotBlank() && !isValidDate(expira)
    val complete  = expira.filter { it.isDigit() }.length == 8
    val valid     = complete && isValidDate(expira)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("✓", color = GreenDark, fontSize = 18.sp)
                Column {
                    Text("¡Producto comprado!", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                    Text("${item.name} · ${item.qty}", fontSize = 12.sp, color = Gray400)
                }
            }
        },
        text = {
            Column {
                Text("¿Cuándo expira? Se agregará a tu inventario.", fontSize = 13.sp, color = Gray400, modifier = Modifier.padding(bottom = 10.dp))
                OutlinedTextField(
                    value = expira,
                    onValueChange = { expira = formatDateInput(it) },
                    label = { Text("Fecha expiración (opcional)") },
                    placeholder = { Text("dd/mm/aaaa") },
                    singleLine = true,
                    isError = dateError,
                    trailingIcon = if (complete) {{
                        Text(if (valid) "✓" else "✕", color = if (valid) GreenDark else RedAlert, fontSize = 14.sp)
                    }} else null,
                    supportingText = if (dateError) {{ Text("Fecha inválida — usá dd/mm/aaaa", color = RedAlert, fontSize = 11.sp) }} else null,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { if (!dateError) onConfirm(expira) }
            ) { Text("Agregar al inventario", color = GreenDark, fontWeight = FontWeight.SemiBold) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } }
    )
}

// ─── Compra row ───────────────────────────────────────────────────────────────
@Composable
fun CompraRow(item: CompraItem, onToggle: () -> Unit, onDelete: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(if (item.checked) Gray800 else White)
                .border(2.dp, if (item.checked) Gray800 else Gray200, CircleShape)
                .clickable { onToggle() }
        ) { if (item.checked) Text("✓", fontSize = 13.sp, color = White) }

        Spacer(Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.name,
                fontSize = 15.sp,
                color = if (item.checked) Gray400 else Gray800,
                textDecoration = if (item.checked) TextDecoration.LineThrough else TextDecoration.None
            )
            if (item.checked) {
                Text("→ agregado al inventario", fontSize = 10.sp, color = GreenDark, fontWeight = FontWeight.SemiBold)
            }
        }

        Text(item.qty, fontSize = 13.sp, color = Gray400, modifier = Modifier.padding(end = 8.dp))
        Text("✕", fontSize = 14.sp, color = Gray400, modifier = Modifier.clickable { onDelete() }.padding(4.dp))
    }
}
