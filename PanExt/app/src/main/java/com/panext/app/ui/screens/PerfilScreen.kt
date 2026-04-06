package com.panext.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import com.google.firebase.auth.FirebaseAuth
import com.panext.app.data.Routes
import com.panext.app.ui.components.PanExtBottomNav
import com.panext.app.ui.theme.*

@Composable
fun PerfilScreen(navController: NavController, onLogout: () -> Unit = {}) {
    Scaffold(
        containerColor = BgColor,
        bottomBar = { PanExtBottomNav(navController, Routes.PERFIL) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Green header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.linearGradient(listOf(GreenDark, GreenLight))
                    )
                    .padding(vertical = 40.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f))
                    ) {
                        Text("👤", fontSize = 36.sp)
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(FirebaseAuth.getInstance().currentUser?.displayName ?: "Usuario", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(FirebaseAuth.getInstance().currentUser?.email ?: "", fontSize = 13.sp, color = Color.White.copy(alpha = 0.8f))
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                        ProfileStat("12", "Ingredientes")
                        ProfileStat("4", "Pendientes")
                        ProfileStat("8", "Recetas")
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Settings list
            Card(
                modifier = Modifier.padding(horizontal = 20.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                listOf(
                    Triple("🔔", "Notificaciones", false),
                    Triple("🎨", "Apariencia", false),
                    Triple("🔒", "Privacidad", false),
                    Triple("🤖", "Preferencias de IA", false),
                    Triple("📊", "Estadísticas", false),
                    Triple("❓", "Ayuda y soporte", false),
                ).forEachIndexed { i, (icon, label, _) ->
                    if (i > 0) HorizontalDivider(color = Gray100)
                    SettingsRow(icon = icon, label = label, textColor = Gray800)
                }
            }

            Spacer(Modifier.height(12.dp))

            // Logout
            Card(
                modifier = Modifier.padding(horizontal = 20.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                SettingsRow(icon = "🚪", label = "Cerrar sesión", textColor = RedAlert, iconBg = Color(0xFFFDECEA), onClick = { FirebaseAuth.getInstance().signOut(); onLogout() })
            }

            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
fun ProfileStat(number: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(number, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text(label, fontSize = 11.sp, color = Color.White.copy(alpha = 0.75f))
    }
}

@Composable
fun SettingsRow(icon: String, label: String, textColor: Color, iconBg: Color = Gray100, onClick: (() -> Unit)? = null) {
    Row(
        modifier = Modifier.fillMaxWidth().then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { }
            .padding(horizontal = 16.dp, vertical = 14.dp)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(iconBg)
        ) {
            Text(icon, fontSize = 20.sp)
        }
        Spacer(Modifier.width(14.dp))
        Text(label, fontSize = 15.sp, color = textColor, modifier = Modifier.weight(1f))
        Text("›", fontSize = 20.sp, color = Gray400)
    }
}
