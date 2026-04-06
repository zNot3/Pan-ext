package com.panext.app.data

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

// ─── Navigation Routes ────────────────────────────────────────────────────────
object Routes {
    const val INICIO         = "inicio"
    const val NOTIFICACIONES = "notificaciones"
    const val PERFIL         = "perfil"
    const val COMPRAS        = "compras"
    const val RECETAS        = "recetas"
    const val RECETAS_VERDES    = "recetas_verdes"
    const val RECETAS_PASTAS    = "recetas_pastas"
    const val RECETAS_DESAYUNOS = "recetas_desayunos"
    const val RECETAS_SOPAS     = "recetas_sopas"
    const val RECETAS_POSTRES   = "recetas_postres"
    const val RECETAS_BEBIDAS   = "recetas_bebidas"
    const val CHAT_IA        = "chat_ia"
    const val INGREDIENTES   = "ingredientes_disponibles"
    const val INVENTARIO     = "inventario"
    const val DETALLE        = "detalle/{itemId}"
    const val RECETA_DETALLE = "receta_detalle/{nombre}"
    fun detalle(itemId: Int) = "detalle/$itemId"
    fun recetaDetalle(nombre: String) = "receta_detalle/${java.net.URLEncoder.encode(nombre, "UTF-8")}"
}

// ─── Data Models ─────────────────────────────────────────────────────────────
data class CompraItem(
    val id: Int,
    val name: String,
    val qty: String,
    var checked: Boolean = false,
    val fromIA: Boolean = false
)

enum class AlertType {
    EXPIRADO, EXPIRA_HOY, EXPIRA_PRONTO, BIEN, POCO;
    val label get() = when (this) {
        EXPIRADO      -> "Expirado"
        EXPIRA_HOY    -> "Expira hoy"
        EXPIRA_PRONTO -> "Expira pronto"
        BIEN          -> "Bien"
        POCO          -> "Queda poco"
    }
}

data class InventarioItem(
    val id: Int,
    val name: String,
    val icon: String,
    val expira: String,
    var qty: Int,
    val alertOverride: AlertType? = null,
    val cal: String = "—",
    val prot: String = "—",
    val gras: String = "—",
    val carb: String = "—"
) {
    val alert: AlertType get() {
        if (alertOverride != null && alertOverride != AlertType.BIEN) return alertOverride
        val date = parseExpiraDate(expira)
        if (date != null) {
            val days = diffDays(date)
            return when {
                days < 0   -> AlertType.EXPIRADO
                days == 0L -> AlertType.EXPIRA_HOY
                days <= 7  -> AlertType.EXPIRA_PRONTO
                else       -> AlertType.BIEN
            }
        }
        if (qty <= 1 && qty > 0) return AlertType.POCO
        return AlertType.BIEN
    }
}

fun parseExpiraDate(str: String): Date? {
    if (str.isBlank() || str == "—") return null
    return try {
        val fmt = if (str.length <= 8)
            SimpleDateFormat("dd/MM/yy", Locale.getDefault())
        else
            SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
        fmt.isLenient = false
        fmt.parse(str)
    } catch (e: Exception) { null }
}

fun diffDays(date: Date): Long {
    val calNow = java.util.Calendar.getInstance().apply {
        set(java.util.Calendar.HOUR_OF_DAY, 0); set(java.util.Calendar.MINUTE, 0)
        set(java.util.Calendar.SECOND, 0);      set(java.util.Calendar.MILLISECOND, 0)
    }
    val calTarget = java.util.Calendar.getInstance().apply {
        time = date
        set(java.util.Calendar.HOUR_OF_DAY, 0); set(java.util.Calendar.MINUTE, 0)
        set(java.util.Calendar.SECOND, 0);      set(java.util.Calendar.MILLISECOND, 0)
    }
    return TimeUnit.MILLISECONDS.toDays(calTarget.timeInMillis - calNow.timeInMillis)
}

fun formatDateInput(raw: String): String {
    val digits = raw.filter { it.isDigit() }.take(8)
    return when {
        digits.length <= 2 -> digits
        digits.length <= 4 -> "${digits.slice(0..1)}/${digits.slice(2 until digits.length)}"
        else -> "${digits.slice(0..1)}/${digits.slice(2..3)}/${digits.slice(4 until digits.length)}"
    }
}

fun isValidDate(str: String): Boolean {
    if (str.isBlank()) return true
    return parseExpiraDate(str) != null
}

data class Notificacion(
    val titulo: String,
    val descripcion: String,
    val tiempo: String,
    val tipo: NotifTipo,
    var leida: Boolean = false
)

enum class NotifTipo { URGENTE, AVISO, INFO, IA, SISTEMA }

data class RecetaItem(
    val nombre: String,
    val icon: String,
    val tiempo: String,
    val ingredientes: String,
    val disponible: Boolean,
    val faltanN: Int = 0,
    val porcentaje: Int = 100
)


data class PasoReceta(val numero: Int, val descripcion: String, val tiempo: String? = null)

data class RecetaDetalle(
    val nombre: String,
    val icon: String,
    val tiempo: String,
    val porciones: Int,
    val ingredientes: List<String>,
    val pasos: List<PasoReceta>
)

data class ChatMensaje(
    val texto: String,
    val esUsuario: Boolean,
    val loading: Boolean = false
)

// ─── Notification generator ───────────────────────────────────────────────────
object NotifGenerator {
    fun generate(inventario: List<InventarioItem>): List<Notificacion> {
        val result = mutableListOf<Notificacion>()
        for (item in inventario) {
            val label = "${item.icon} ${item.name}"
            val date  = parseExpiraDate(item.expira)
            val days  = date?.let { diffDays(it) }
            when (item.alert) {
                AlertType.EXPIRADO -> result.add(Notificacion(
                    titulo = "$label expiró",
                    descripcion = if (days != null) "Venció hace ${Math.abs(days.toInt())} día${if (Math.abs(days.toInt()) != 1) "s" else ""}. Revisá si todavía es seguro consumirlo." else "Marcado como expirado.",
                    tiempo = "Ahora", tipo = NotifTipo.URGENTE
                ))
                AlertType.EXPIRA_HOY -> result.add(Notificacion(
                    titulo = "$label expira hoy",
                    descripcion = "¡Úsalo hoy antes de que venza!",
                    tiempo = "Hoy", tipo = NotifTipo.URGENTE
                ))
                AlertType.EXPIRA_PRONTO -> result.add(Notificacion(
                    titulo = if (days == 1L) "$label expira mañana" else "$label expira en $days días",
                    descripcion = "Vence el ${item.expira}. Considerá usarlo pronto.",
                    tiempo = if (days == 1L) "Mañana" else "En $days días",
                    tipo = if (days != null && days <= 3) NotifTipo.URGENTE else NotifTipo.AVISO
                ))
                AlertType.POCO -> result.add(Notificacion(
                    titulo = "Queda poco de $label",
                    descripcion = "Solo queda ${item.qty} unidad. Considerá agregarlo a tu lista de compras.",
                    tiempo = "Ahora", tipo = NotifTipo.AVISO
                ))
                AlertType.BIEN -> {}
            }
        }
        return result
    }
}

// ─── Static App Data ──────────────────────────────────────────────────────────
object AppData {

    val compras = mutableListOf<CompraItem>()

    val sugerenciasIA = mutableListOf(
        "Aceite de oliva", "Ajo", "Cebolla", "Espinacas", "Yogur natural"
    )

    val inventario = mutableListOf<InventarioItem>()

    val recetasDisponibles = listOf(
        RecetaItem("Tortilla española",     "🍳", "15 min", "4 ingredientes · Desayuno",  true,  porcentaje = 100),
        RecetaItem("Ensalada griega",       "🥗", "10 min", "5 ingredientes · Ensaladas", true,  porcentaje = 100),
        RecetaItem("Sopa de tomate",        "🍲", "25 min", "4 ingredientes · Sopas",     true,  porcentaje = 100),
        RecetaItem("Wrap vegetariano",      "🫔", "20 min", "6 ingredientes · Vegano",    true,  porcentaje = 100),
        RecetaItem("Guiso de garbanzos",    "🍛", "40 min", "7 ingredientes · Principal", false, faltanN = 1, porcentaje = 86),
        RecetaItem("Tortitas de avena",     "🥞", "12 min", "4 ingredientes · Desayuno",  true,  porcentaje = 100),
        RecetaItem("Pasta con ajo y aceite","🍝", "20 min", "4 ingredientes · Pastas",    true,  porcentaje = 100),
    )
    val recetasVerdesDisponibles = listOf(
        RecetaItem("Ensalada mediterránea","🥗","20 min","4 ingredientes disponibles",true),
        RecetaItem("Wrap de espinaca","🫔","15 min","3 ingredientes disponibles",true),
        RecetaItem("Sopa de acelga","🍲","35 min","5 ingredientes disponibles",true),
    )
    val recetasVerdesOtras = listOf(
        RecetaItem("Bowl de kale","🥬","","Faltan 2 ingredientes",false,faltanN=2),
        RecetaItem("Pesto casero","🌿","","Faltan 3 ingredientes",false,faltanN=3),
    )
    val recetasPastasDisponibles = listOf(
        RecetaItem("Pasta con ajo y aceite","🍝","20 min","4 ingredientes disponibles",true),
        RecetaItem("Pasta al limón","🍋","25 min","5 ingredientes disponibles",true),
    )
    val recetasPastasOtras = listOf(
        RecetaItem("Pasta carbonara","🥚","","Faltan 2 ingredientes",false,faltanN=2),
        RecetaItem("Lasaña vegetal","🫑","","Faltan 4 ingredientes",false,faltanN=4),
        RecetaItem("Pasta primavera","🌸","","Faltan 1 ingrediente",false,faltanN=1),
    )
    val recetasDesayunosDisponibles = listOf(
        RecetaItem("Tortilla española","🍳","15 min","4 ingredientes disponibles",true),
        RecetaItem("Tortitas de avena","🥞","12 min","4 ingredientes disponibles",true),
    )
    val recetasDesayunosOtras = listOf(
        RecetaItem("Granola casera","🌾","","Faltan 3 ingredientes",false,faltanN=3),
        RecetaItem("Smoothie de frutas","🍓","","Faltan 2 ingredientes",false,faltanN=2),
    )
    val recetasSopasDisponibles = listOf(
        RecetaItem("Sopa de tomate","🍅","25 min","4 ingredientes disponibles",true),
        RecetaItem("Caldo de verduras","🥕","30 min","5 ingredientes disponibles",true),
    )
    val recetasSopasOtras = listOf(
        RecetaItem("Crema de calabaza","🎃","","Faltan 2 ingredientes",false,faltanN=2),
        RecetaItem("Ramen casero","🍜","","Faltan 5 ingredientes",false,faltanN=5),
    )
    val recetasPostresDisponibles = listOf(
        RecetaItem("Flan de huevo","🍮","40 min","3 ingredientes disponibles",true),
    )
    val recetasPostresOtras = listOf(
        RecetaItem("Brownie de chocolate","🍫","","Faltan 3 ingredientes",false,faltanN=3),
        RecetaItem("Tarta de manzana","🍎","","Faltan 4 ingredientes",false,faltanN=4),
        RecetaItem("Mousse de limón","🍋","","Faltan 2 ingredientes",false,faltanN=2),
    )
    val recetasBebidasDisponibles = listOf(
        RecetaItem("Limonada natural","🍋","5 min","2 ingredientes disponibles",true),
        RecetaItem("Agua de pepino","🥒","10 min","3 ingredientes disponibles",true),
    )

    val recetasDetalle: Map<String, RecetaDetalle> = mapOf(
        "Tortilla española" to RecetaDetalle(
            nombre = "Tortilla española", icon = "🍳", tiempo = "15 min", porciones = 4,
            ingredientes = listOf("4 huevos", "3 papas medianas", "1 cebolla", "Aceite de oliva", "Sal al gusto"),
            pasos = listOf(
                PasoReceta(1, "Pelá y cortá las papas en rodajas finas. Hacé lo mismo con la cebolla.", "3 min"),
                PasoReceta(2, "Calentá abundante aceite en una sartén y freí las papas con la cebolla a fuego medio hasta que estén tiernas.", "8 min"),
                PasoReceta(3, "Retirá las papas del aceite y escurrilas bien. Reservá."),
                PasoReceta(4, "Batí los huevos con sal en un bowl grande. Agregá las papas y mezclá bien.", "2 min"),
                PasoReceta(5, "En una sartén con un poco de aceite, volcá la mezcla a fuego medio-bajo.", "3 min"),
                PasoReceta(6, "Cuando los bordes estén cuajados, colocá un plato encima y dala vuelta. Volvé a la sartén por el otro lado.", "3 min"),
                PasoReceta(7, "Serví caliente o a temperatura ambiente. ¡Listo!")
            )
        ),
        "Ensalada griega" to RecetaDetalle(
            nombre = "Ensalada griega", icon = "🥗", tiempo = "10 min", porciones = 2,
            ingredientes = listOf("2 tomates", "1 pepino", "1/2 cebolla morada", "Aceitunas negras", "Queso feta", "Aceite de oliva", "Orégano"),
            pasos = listOf(
                PasoReceta(1, "Cortá los tomates en cubos grandes y el pepino en rodajas."),
                PasoReceta(2, "Cortá la cebolla morada en aros finos."),
                PasoReceta(3, "Combiná tomates, pepino y cebolla en un bowl."),
                PasoReceta(4, "Agregá las aceitunas y el queso feta desmenuzado encima."),
                PasoReceta(5, "Rociá con aceite de oliva y espolvoreá orégano. Serví fresco.")
            )
        ),
        "Sopa de tomate" to RecetaDetalle(
            nombre = "Sopa de tomate", icon = "🍲", tiempo = "25 min", porciones = 4,
            ingredientes = listOf("6 tomates", "1 cebolla", "2 dientes de ajo", "Caldo de verduras", "Aceite de oliva", "Sal y pimienta", "Albahaca"),
            pasos = listOf(
                PasoReceta(1, "Picá la cebolla y el ajo. Sofreilos en una olla con aceite de oliva a fuego medio.", "5 min"),
                PasoReceta(2, "Agregá los tomates picados y cocinás revolviendo hasta que se deshagan.", "8 min"),
                PasoReceta(3, "Vertí el caldo de verduras y dejá hervir.", "5 min"),
                PasoReceta(4, "Triturá todo con una licuadora de mano hasta obtener una crema suave."),
                PasoReceta(5, "Condimentá con sal, pimienta y albahaca. Serví caliente.")
            )
        ),
        "Pasta con ajo y aceite" to RecetaDetalle(
            nombre = "Pasta con ajo y aceite", icon = "🍝", tiempo = "20 min", porciones = 2,
            ingredientes = listOf("200g de pasta", "4 dientes de ajo", "Aceite de oliva", "Perejil fresco", "Sal", "Pimienta roja opcional"),
            pasos = listOf(
                PasoReceta(1, "Herví agua con sal y cociná la pasta según las instrucciones del paquete.", "10 min"),
                PasoReceta(2, "Mientras tanto, laminá los ajos finamente."),
                PasoReceta(3, "En una sartén grande calentá el aceite y dorá el ajo a fuego bajo sin que se queme.", "4 min"),
                PasoReceta(4, "Escurrí la pasta guardando un poco del agua de cocción."),
                PasoReceta(5, "Saltá la pasta en la sartén con el ajo, agregando agua de cocción si hace falta.", "2 min"),
                PasoReceta(6, "Serví con perejil picado y pimienta roja si deseás.")
            )
        ),
        "Tortitas de avena" to RecetaDetalle(
            nombre = "Tortitas de avena", icon = "🥞", tiempo = "12 min", porciones = 2,
            ingredientes = listOf("1 taza de avena", "2 huevos", "1 banana", "1/2 taza de leche", "1 cdta de canela"),
            pasos = listOf(
                PasoReceta(1, "Pisá la banana con un tenedor hasta hacer un puré."),
                PasoReceta(2, "Mezclá el puré con los huevos, la leche y la canela."),
                PasoReceta(3, "Incorporá la avena y dejá reposar 2 minutos.", "2 min"),
                PasoReceta(4, "Calentá una sartén antiadherente con un poco de aceite o manteca."),
                PasoReceta(5, "Volcá porciones de la mezcla y cocinás a fuego medio hasta que aparezcan burbujas.", "3 min"),
                PasoReceta(6, "Dales vuelta y cocinás 2 minutos más. Servís con miel o frutas.", "2 min")
            )
        ),
        "Flan de huevo" to RecetaDetalle(
            nombre = "Flan de huevo", icon = "🍮", tiempo = "40 min", porciones = 6,
            ingredientes = listOf("4 huevos", "500ml leche", "100g azúcar", "1 cdta esencia de vainilla", "Para el caramelo: 100g azúcar"),
            pasos = listOf(
                PasoReceta(1, "Hacé el caramelo derritiendo el azúcar en una flanera a fuego medio sin revolver hasta que tome color dorado.", "5 min"),
                PasoReceta(2, "Inclinás la flanera para cubrir los bordes con el caramelo. Reservá."),
                PasoReceta(3, "Calentá la leche sin hervir. Batí los huevos con el azúcar y la vainilla.", "3 min"),
                PasoReceta(4, "Incorporá la leche caliente a los huevos batiendo constantemente."),
                PasoReceta(5, "Filtrá la mezcla y volcala en la flanera caramelizada."),
                PasoReceta(6, "Cocinás a baño María en el horno a 170°C por 30 minutos.", "30 min"),
                PasoReceta(7, "Dejás enfriar y refrigerás mínimo 2 horas antes de desmoldar.")
            )
        )
    )

    val recetasBebidasOtras = listOf(
        RecetaItem("Smoothie verde","🥦","","Faltan 2 ingredientes",false,faltanN=2),
        RecetaItem("Té de jengibre","🫚","","Faltan 1 ingrediente",false,faltanN=1),
    )
}
