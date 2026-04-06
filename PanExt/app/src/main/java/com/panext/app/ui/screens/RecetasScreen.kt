package com.panext.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.panext.app.data.AppData
import com.panext.app.data.RecetaItem
import com.panext.app.data.Routes
import com.panext.app.ui.components.*
import com.panext.app.ui.theme.*

// ─── Recetas Main Screen ──────────────────────────────────────────────────────
@Composable
fun RecetasScreen(navController: NavController) {
    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.RECETAS) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
        ) {
            Spacer(Modifier.height(16.dp))
            Text("Recetas", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Gray800)
            Text("¿Qué cocinarás hoy?", fontSize = 13.sp, color = Gray400,
                modifier = Modifier.padding(top = 2.dp, bottom = 16.dp))

            // Green banner - usar ingredientes
            RecipeBanner(
                icon = "🥗",
                title = "Usar ingredientes disponibles",
                subtitle = "Tenemos 8 recetas para ti",
                gradient = Brush.linearGradient(listOf(GreenDark, GreenCard))
            ) { navController.navigate(Routes.INGREDIENTES) }

            Spacer(Modifier.height(10.dp))

            // Purple banner - IA
            RecipeBanner(
                icon = "✨",
                title = "¿Tienes una idea?",
                subtitle = "¡Démosle vida con IA!",
                gradient = Brush.linearGradient(listOf(PurpleDark, Color(0xFF6A3EA1)))
            ) { navController.navigate(Routes.CHAT_IA) }

            Spacer(Modifier.height(16.dp))
            SectionLabel("📂 Explorar por categoría")

            // Category grid
            val categories = listOf(
                Triple("🥦", "Verdes",     Routes.RECETAS_VERDES),
                Triple("🍝", "Pastas",     Routes.RECETAS_PASTAS),
                Triple("🍳", "Desayunos",  Routes.RECETAS_DESAYUNOS),
                Triple("🍲", "Sopas",      Routes.RECETAS_SOPAS),
                Triple("🍮", "Postres",    Routes.RECETAS_POSTRES),
                Triple("🧃", "Bebidas",    Routes.RECETAS_BEBIDAS)
            )
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                categories.chunked(2).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        row.forEach { (emoji, name, route) ->
                            CategoryCard(
                                emoji = emoji,
                                name = name,
                                modifier = Modifier.weight(1f)
                            ) { navController.navigate(route) }
                        }
                        if (row.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }

            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
fun RecipeBanner(icon: String, title: String, subtitle: String, gradient: Brush, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(gradient)
            .clickable { onClick() }
            .padding(18.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(icon, fontSize = 30.sp, modifier = Modifier.padding(end = 14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(subtitle, fontSize = 12.sp, color = Color.White.copy(alpha = 0.8f), modifier = Modifier.padding(top = 2.dp))
            }
            Text("›", fontSize = 22.sp, color = Color.White.copy(alpha = 0.7f))
        }
    }
}

@Composable
fun CategoryCard(emoji: String, name: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth().padding(vertical = 20.dp, horizontal = 12.dp)
        ) {
            Text(emoji, fontSize = 32.sp, modifier = Modifier.padding(bottom = 8.dp))
            Text(name, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Gray800)
        }
    }
}

// ─── Recetas Verdes Screen ────────────────────────────────────────────────────
@Composable
fun RecetasVerdesScreen(navController: NavController) {
    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.RECETAS_VERDES) }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            BackHeader(title = "🥦 Verdes") { navController.popBackStack() }
            Column(
                modifier = Modifier
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp)
            ) {
                PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
                    SectionLabel("🌿 Con ingredientes disponibles")
                    AppData.recetasVerdesDisponibles.forEachIndexed { i, receta ->
                        if (i > 0) ItemDivider()
                        RecetaListRow(receta, navController)
                    }
                }
                PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
                    SectionLabel("🔒 Otras recetas")
                    AppData.recetasVerdesOtras.forEachIndexed { i, receta ->
                        if (i > 0) ItemDivider()
                        RecetaListRow(receta, navController)
                    }
                }
                Spacer(Modifier.height(20.dp))
            }
        }
    }
}

@Composable
fun RecetaListRow(receta: RecetaItem, navController: androidx.navigation.NavController? = null) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { if (receta.disponible) navController?.navigate(Routes.recetaDetalle(receta.nombre)) }
            .padding(vertical = 14.dp)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(50.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Gray100)
        ) {
            Text(receta.icon, fontSize = 26.sp)
        }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(receta.nombre, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Gray800)
            Text(
                if (receta.disponible) "${receta.tiempo} · ${receta.ingredientes}"
                else receta.ingredientes,
                fontSize = 12.sp, color = Gray400,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
        Text("›", fontSize = 18.sp, color = Gray400)
    }
}

// ─── Ingredientes Disponibles Screen ─────────────────────────────────────────
@Composable
fun IngredientesScreen(navController: NavController) {
    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.INGREDIENTES) }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(androidx.compose.foundation.shape.CircleShape)
                        .background(Gray100)
                        .clickable { navController.popBackStack() }
                ) { Text("‹", fontSize = 22.sp, color = Gray800) }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text("Ingredientes disponibles", fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = Gray800)
                    Text("8 recetas listas para cocinar", fontSize = 12.sp, color = Gray400)
                }
            }
            Column(
                modifier = Modifier
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp)
            ) {
                PanExtCard {
                    SectionLabel("🥗 Puedes cocinar ahora")
                    AppData.recetasDisponibles.forEachIndexed { i, receta ->
                        if (i > 0) ItemDivider()
                        AvailableRecipeRow(receta, navController)
                    }
                }
                Spacer(Modifier.height(20.dp))
            }
        }
    }
}

@Composable
fun AvailableRecipeRow(receta: RecetaItem, navController: androidx.navigation.NavController? = null) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { }
            .padding(vertical = 14.dp)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(50.dp).clip(RoundedCornerShape(12.dp)).background(Gray100)
        ) { Text(receta.icon, fontSize = 26.sp) }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(receta.nombre, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Gray800)
            Text("${receta.tiempo} · ${receta.ingredientes}", fontSize = 12.sp, color = Gray400, modifier = Modifier.padding(top = 2.dp))
        }
        val pct = receta.porcentaje
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(if (pct == 100) GreenSoft else Gray100)
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Text("$pct%", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = if (pct == 100) GreenDark else Gray600)
        }
    }
}

// ─── Generic Category Screen (reusable for all categories) ───────────────────
@Composable
fun CategoriaRecetasScreen(
    navController: NavController,
    titulo: String,
    disponibles: List<RecetaItem>,
    otras: List<RecetaItem>
) {
    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.RECETAS) }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            BackHeader(title = titulo) { navController.popBackStack() }
            Column(
                modifier = Modifier
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp)
            ) {
                if (disponibles.isNotEmpty()) {
                    PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
                        SectionLabel("🌿 Con ingredientes disponibles")
                        disponibles.forEachIndexed { i, receta ->
                            if (i > 0) ItemDivider()
                            RecetaListRow(receta, navController)
                        }
                    }
                }
                if (otras.isNotEmpty()) {
                    PanExtCard(modifier = Modifier.padding(bottom = 12.dp)) {
                        SectionLabel("🔒 Otras recetas")
                        otras.forEachIndexed { i, receta ->
                            if (i > 0) ItemDivider()
                            RecetaListRow(receta, navController)
                        }
                    }
                }
                Spacer(Modifier.height(20.dp))
            }
        }
    }
}

// ─── Individual category screens ─────────────────────────────────────────────
@Composable
fun RecetasPastasScreen(navController: NavController) =
    CategoriaRecetasScreen(navController, "🍝 Pastas",
        AppData.recetasPastasDisponibles, AppData.recetasPastasOtras)

@Composable
fun RecetasDesayunosScreen(navController: NavController) =
    CategoriaRecetasScreen(navController, "🍳 Desayunos",
        AppData.recetasDesayunosDisponibles, AppData.recetasDesayunosOtras)

@Composable
fun RecetasSopasScreen(navController: NavController) =
    CategoriaRecetasScreen(navController, "🍲 Sopas",
        AppData.recetasSopasDisponibles, AppData.recetasSopasOtras)

@Composable
fun RecetasPostresScreen(navController: NavController) =
    CategoriaRecetasScreen(navController, "🍮 Postres",
        AppData.recetasPostresDisponibles, AppData.recetasPostresOtras)

@Composable
fun RecetasBebidasScreen(navController: NavController) =
    CategoriaRecetasScreen(navController, "🧃 Bebidas",
        AppData.recetasBebidasDisponibles, AppData.recetasBebidasOtras)
