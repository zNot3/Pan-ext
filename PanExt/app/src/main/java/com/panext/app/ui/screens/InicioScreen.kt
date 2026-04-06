package com.panext.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.google.firebase.auth.FirebaseAuth
import com.panext.app.data.Routes
import com.panext.app.ui.components.*
import com.panext.app.ui.theme.*

@Composable
fun InicioScreen(navController: NavController) {
    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.INICIO) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
        ) {
            Spacer(Modifier.height(16.dp))

            // Greeting
            Text(
                text = "¡Hola, ${FirebaseAuth.getInstance().currentUser?.displayName?.split(" ")?.firstOrNull() ?: "Chef"}! 👋",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = Gray800
            )
            Text(
                text = "Aquí está tu resumen de hoy",
                fontSize = 14.sp,
                color = Gray400,
                modifier = Modifier.padding(top = 2.dp, bottom = 16.dp)
            )

            // Notificaciones card
            PanExtCard(modifier = Modifier.padding(bottom = 16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("🔔 Notificaciones", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                    Text(
                        "Ver todas",
                        color = GreenDark,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable { navController.navigate(Routes.NOTIFICACIONES) }
                    )
                }
                Spacer(Modifier.height(8.dp))
                listOf(
                    "La leche expira mañana",
                    "Queda poco pan (1 unidad)",
                    "3 recetas con tus ingredientes"
                ).forEachIndexed { i, text ->
                    if (i > 0) ItemDivider()
                    Row(
                        modifier = Modifier.padding(vertical = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("●", color = Gray400, fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp))
                        Text(text, fontSize = 14.sp, color = Gray800)
                    }
                }
            }

            // Quick access grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                QuickCard(
                    icon = "🛒", title = "Compras", subtitle = "4 pendientes",
                    modifier = Modifier.weight(1f)
                ) { navController.navigate(Routes.COMPRAS) }
                QuickCard(
                    icon = "🍽️", title = "Recetas", subtitle = "Generar nueva",
                    modifier = Modifier.weight(1f)
                ) { navController.navigate(Routes.RECETAS) }
            }

            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                QuickCard(
                    icon = "📦", title = "Inventario", subtitle = "12 elementos",
                    modifier = Modifier.weight(1f)
                ) { navController.navigate(Routes.INVENTARIO) }
                QuickCard(
                    icon = "✨", title = "IA", subtitle = "Sorpréndeme",
                    modifier = Modifier.weight(1f)
                ) { navController.navigate(Routes.CHAT_IA) }
            }

            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
fun QuickCard(icon: String, title: String, subtitle: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp, 20.dp, 16.dp, 20.dp)) {
            Text(icon, fontSize = 28.sp, modifier = Modifier.padding(bottom = 10.dp))
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Gray800)
            Text(subtitle, fontSize = 12.sp, color = Gray400, modifier = Modifier.padding(top = 2.dp))
        }
    }
}
