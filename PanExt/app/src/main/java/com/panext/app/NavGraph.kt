package com.panext.app

import androidx.compose.runtime.*
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.google.firebase.auth.FirebaseAuth
import java.net.URLDecoder
import com.panext.app.data.Routes
import com.panext.app.ui.screens.*
import com.panext.app.ui.theme.PanExtTheme

@Composable
fun PanExtApp() {
    PanExtTheme {
        val auth = FirebaseAuth.getInstance()
        var isLoggedIn by remember { mutableStateOf(auth.currentUser != null) }

        if (!isLoggedIn) {
            AuthScreen(onAuthSuccess = { isLoggedIn = true })
            return@PanExtTheme
        }

        val navController = rememberNavController()

        NavHost(
            navController = navController,
            startDestination = Routes.INICIO
        ) {
            composable(Routes.INICIO) {
                InicioScreen(navController)
            }
            composable(Routes.NOTIFICACIONES) {
                NotificacionesScreen(navController)
            }
            composable(Routes.PERFIL) {
                PerfilScreen(navController, onLogout = {
                    auth.signOut()
                    isLoggedIn = false
                })
            }
            composable(Routes.COMPRAS) {
                ComprasScreen(navController)
            }
            composable(Routes.RECETAS) {
                RecetasScreen(navController)
            }
            composable(Routes.RECETAS_VERDES) {
                RecetasVerdesScreen(navController)
            }
            composable(Routes.RECETAS_PASTAS) {
                RecetasPastasScreen(navController)
            }
            composable(Routes.RECETAS_DESAYUNOS) {
                RecetasDesayunosScreen(navController)
            }
            composable(Routes.RECETAS_SOPAS) {
                RecetasSopasScreen(navController)
            }
            composable(Routes.RECETAS_POSTRES) {
                RecetasPostresScreen(navController)
            }
            composable(Routes.RECETAS_BEBIDAS) {
                RecetasBebidasScreen(navController)
            }
            composable(Routes.CHAT_IA) {
                ChatIAScreen(navController)
            }
            composable(Routes.INGREDIENTES) {
                IngredientesScreen(navController)
            }
            composable(Routes.INVENTARIO) {
                InventarioScreen(navController)
            }
            composable(
                route = Routes.DETALLE,
                arguments = listOf(navArgument("itemId") { type = NavType.IntType })
            ) { backStackEntry ->
                val itemId = backStackEntry.arguments?.getInt("itemId") ?: 1
                DetalleScreen(navController, itemId)
            }
            composable(
                route = Routes.RECETA_DETALLE,
                arguments = listOf(navArgument("nombre") { type = NavType.StringType })
            ) { backStackEntry ->
                val nombre = URLDecoder.decode(
                    backStackEntry.arguments?.getString("nombre") ?: "", "UTF-8"
                )
                RecetaDetalleScreen(navController, nombre)
            }
        }
    }
}
