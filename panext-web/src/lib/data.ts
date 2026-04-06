// ─── Types ────────────────────────────────────────────────────────────────────
export type AlertType = "expira" | "poco" | null;
export type NotifTipo = "urgente" | "aviso" | "info" | "ia" | "sistema";

export interface CompraItem {
  id: number;
  name: string;
  qty: string;
  category: string;
  checked: boolean;
  fromIA?: boolean;
}

export interface InventarioItem {
  id: number;
  name: string;
  icon: string;
  expira: string;
  qty: number;
  alert: AlertType;
  cal: string;
  prot: string;
  gras: string;
  carb: string;
}

export interface Notificacion {
  id: number;
  titulo: string;
  descripcion: string;
  tiempo: string;
  tipo: NotifTipo;
  leida: boolean;
}

export interface RecetaPaso {
  numero: number;
  titulo: string;
  descripcion: string;
}

export interface RecetaItem {
  id: number;
  nombre: string;
  icon: string;
  tiempo: string;
  porciones: string;
  dificultad: string;
  ingredientes: string;
  ingredientesList: string[];
  pasos: RecetaPaso[];
  disponible: boolean;
  faltanN?: number;
  porcentaje: number;
  categoria: string;
  cal: string;
  prot: string;
  gras: string;
  carb: string;
}

// ─── Recetas completas ────────────────────────────────────────────────────────
export const recetas: RecetaItem[] = [
  {
    id: 1, nombre:"Ensalada mediterránea", icon:"🥗", tiempo:"20 min", porciones:"4",
    dificultad:"Fácil", ingredientes:"4 ingredientes", disponible:true, porcentaje:100, categoria:"Verdes",
    cal:"180 kcal", prot:"5g", gras:"12g", carb:"14g",
    ingredientesList: ["2 tazas de lechuga romana", "1 pepino en rodajas", "200g de tomates cherry", "100g de queso feta", "50g de aceitunas negras", "3 cdas de aceite de oliva", "1 cda de zumo de limón", "Sal y pimienta al gusto"],
    pasos: [
      { numero:1, titulo:"Preparar la base", descripcion:"Lava bien la lechuga romana y córtala en trozos medianos. Colócala en un bol grande como base de la ensalada." },
      { numero:2, titulo:"Cortar los vegetales", descripcion:"Corta el pepino en rodajas finas y los tomates cherry por la mitad. Añádelos al bol con la lechuga." },
      { numero:3, titulo:"Agregar el queso y aceitunas", descripcion:"Desmenuza el queso feta sobre la ensalada y agrega las aceitunas negras distribuidas uniformemente." },
      { numero:4, titulo:"Preparar el aderezo", descripcion:"En un recipiente pequeño, mezcla el aceite de oliva con el zumo de limón, sal y pimienta. Bate bien con un tenedor." },
      { numero:5, titulo:"Servir", descripcion:"Rocía el aderezo sobre la ensalada justo antes de servir y mezcla suavemente. ¡Lista para disfrutar!" },
    ],
  },
  {
    id: 2, nombre:"Pasta al limón", icon:"🍝", tiempo:"25 min", porciones:"2",
    dificultad:"Fácil", ingredientes:"5 ingredientes", disponible:true, porcentaje:100, categoria:"Pastas",
    cal:"420 kcal", prot:"12g", gras:"15g", carb:"60g",
    ingredientesList: ["250g de pasta spaghetti", "2 limones (ralladura y zumo)", "3 dientes de ajo", "4 cdas de aceite de oliva", "50g de queso parmesano rallado", "Sal, pimienta y perejil fresco"],
    pasos: [
      { numero:1, titulo:"Cocer la pasta", descripcion:"Hierve abundante agua con sal. Cocina la pasta según las instrucciones del paquete hasta que esté al dente. Reserva 1 taza del agua de cocción." },
      { numero:2, titulo:"Preparar el sofrito", descripcion:"Mientras la pasta se cocina, calienta el aceite de oliva a fuego medio. Añade el ajo finamente picado y sofríe 2 minutos sin que se dore." },
      { numero:3, titulo:"Añadir el limón", descripcion:"Agrega la ralladura de los 2 limones y el zumo al sofrito. Mezcla bien y cocina 1 minuto más." },
      { numero:4, titulo:"Combinar", descripcion:"Escurre la pasta y añádela a la sartén con el sofrito. Agrega un chorrito del agua de cocción reservada y mezcla bien para que la salsa emulsione." },
      { numero:5, titulo:"Terminar y servir", descripcion:"Retira del fuego, añade el parmesano rallado y el perejil picado. Mezcla bien, ajusta de sal y pimienta, y sirve inmediatamente." },
    ],
  },
  {
    id: 3, nombre:"Sopa de acelga", icon:"🍲", tiempo:"35 min", porciones:"4",
    dificultad:"Media", ingredientes:"5 ingredientes", disponible:true, porcentaje:100, categoria:"Verdes",
    cal:"120 kcal", prot:"6g", gras:"4g", carb:"16g",
    ingredientesList: ["1 manojo de acelgas", "2 papas medianas", "1 cebolla", "2 dientes de ajo", "1 litro de caldo de verduras", "2 cdas de aceite de oliva", "Sal, pimienta y pimentón"],
    pasos: [
      { numero:1, titulo:"Preparar los vegetales", descripcion:"Lava bien las acelgas y córtalas en trozos. Pela y corta las papas en cubos medianos. Pica finamente la cebolla y el ajo." },
      { numero:2, titulo:"Sofrito base", descripcion:"En una olla grande, calienta el aceite a fuego medio. Sofríe la cebolla y el ajo durante 5 minutos hasta que estén transparentes." },
      { numero:3, titulo:"Agregar papas", descripcion:"Añade las papas en cubos y rehoga 3 minutos más. Sazona con sal, pimienta y una pizca de pimentón." },
      { numero:4, titulo:"Cocinar la sopa", descripcion:"Vierte el caldo caliente sobre las papas. Lleva a ebullición, luego reduce el fuego y cocina 15 minutos." },
      { numero:5, titulo:"Incorporar las acelgas", descripcion:"Agrega las acelgas troceadas y cocina 8 minutos más. Prueba y ajusta la sazón antes de servir." },
    ],
  },
  {
    id: 4, nombre:"Tortilla española", icon:"🍳", tiempo:"15 min", porciones:"4",
    dificultad:"Fácil", ingredientes:"4 ingredientes", disponible:true, porcentaje:100, categoria:"Desayunos",
    cal:"280 kcal", prot:"14g", gras:"18g", carb:"16g",
    ingredientesList: ["6 huevos", "3 papas medianas", "1 cebolla", "4 cdas de aceite de oliva", "Sal al gusto"],
    pasos: [
      { numero:1, titulo:"Preparar las papas", descripcion:"Pela las papas y córtalas en láminas finas. Pica la cebolla en juliana fina." },
      { numero:2, titulo:"Pochar las papas", descripcion:"Calienta el aceite en una sartén antiadherente a fuego medio. Añade las papas y la cebolla con sal. Cocina tapado 15 minutos, removiendo ocasionalmente, hasta que estén tiernas." },
      { numero:3, titulo:"Batir los huevos", descripcion:"Bate los huevos en un bol grande con una pizca de sal. Cuando las papas estén listas, escúrrelas del aceite y añádelas al bol con los huevos. Mezcla bien y deja reposar 5 minutos." },
      { numero:4, titulo:"Cuajar la tortilla", descripcion:"Pon 1 cda de aceite en la sartén a fuego medio-alto. Vierte la mezcla y extiende bien. Cocina 3-4 minutos hasta que los bordes estén cuajados." },
      { numero:5, titulo:"Dar la vuelta y terminar", descripcion:"Con la ayuda de un plato, dale la vuelta a la tortilla y vuelve a la sartén. Cocina 2-3 minutos más según tu preferencia (jugosa o bien hecha). ¡Sirve caliente o fría!" },
    ],
  },
  {
    id: 5, nombre:"Guiso de lentejas", icon:"🫘", tiempo:"45 min", porciones:"4",
    dificultad:"Fácil", ingredientes:"7 ingredientes", disponible:true, porcentaje:100, categoria:"Sopas",
    cal:"320 kcal", prot:"18g", gras:"6g", carb:"48g",
    ingredientesList: ["300g de lentejas", "1 cebolla", "2 zanahorias", "3 dientes de ajo", "1 tomate", "1 cdta de comino", "1 cdta de pimentón dulce", "3 cdas de aceite de oliva", "Sal y pimienta"],
    pasos: [
      { numero:1, titulo:"Remojar las lentejas", descripcion:"Si usás lentejas secas, remójalas 1 hora antes. Si son de bote, solo enjuágalas bien." },
      { numero:2, titulo:"Preparar el sofrito", descripcion:"Pica la cebolla, el ajo, las zanahorias y el tomate. En una olla, calienta el aceite y sofríe la cebolla y el ajo 5 minutos." },
      { numero:3, titulo:"Añadir vegetales y especias", descripcion:"Agrega las zanahorias y el tomate. Cocina 5 minutos más. Añade el comino y el pimentón, remueve 1 minuto para que liberen su aroma." },
      { numero:4, titulo:"Cocinar las lentejas", descripcion:"Incorpora las lentejas y cubre con 1 litro de agua o caldo. Lleva a ebullición, reduce el fuego y cocina 30 minutos." },
      { numero:5, titulo:"Ajustar y servir", descripcion:"Comprueba que las lentejas estén tiernas. Ajusta de sal, pimienta y agua si hace falta. Sirve caliente." },
    ],
  },
  {
    id: 6, nombre:"Wrap vegetariano", icon:"🫔", tiempo:"20 min", porciones:"2",
    dificultad:"Fácil", ingredientes:"6 ingredientes", disponible:true, porcentaje:100, categoria:"Verdes",
    cal:"350 kcal", prot:"12g", gras:"14g", carb:"44g",
    ingredientesList: ["2 tortillas de trigo grandes", "1 aguacate", "1 tomate", "100g de lechuga", "50g de maíz dulce", "2 cdas de queso crema", "Zumo de limón, sal y pimienta"],
    pasos: [
      { numero:1, titulo:"Preparar el relleno", descripcion:"Corta el aguacate en láminas y el tomate en cubos. Lava y seca bien la lechuga." },
      { numero:2, titulo:"Sazonar el aguacate", descripcion:"Rocía el aguacate con zumo de limón y una pizca de sal para evitar que se oxide." },
      { numero:3, titulo:"Calentar las tortillas", descripcion:"Calienta las tortillas en una sartén seca a fuego medio, 30 segundos por cada lado." },
      { numero:4, titulo:"Armar el wrap", descripcion:"Extiende el queso crema sobre cada tortilla. Coloca la lechuga, el tomate, el aguacate y el maíz en el centro." },
      { numero:5, titulo:"Enrollar y servir", descripcion:"Dobla los laterales de la tortilla hacia adentro y enrolla firmemente. Córtalo por la mitad en diagonal y sirve." },
    ],
  },
  {
    id: 9, nombre:"Salteado de brócoli", icon:"🥦", tiempo:"15 min", porciones:"2",
    dificultad:"Fácil", ingredientes:"4 ingredientes", disponible:true, porcentaje:100, categoria:"Verdes",
    cal:"140 kcal", prot:"7g", gras:"7g", carb:"12g",
    ingredientesList: ["1 brócoli grande", "3 dientes de ajo", "2 cdas de aceite de oliva", "1 cda de salsa de soja", "Sal, pimienta y chile en hojuelas (opcional)"],
    pasos: [
      { numero:1, titulo:"Preparar el brócoli", descripcion:"Lava el brócoli y córtalo en ramilletes medianos. Pela los tallos y córtalos en rodajas." },
      { numero:2, titulo:"Blanquear", descripcion:"Hierve agua con sal y cocina el brócoli 2 minutos. Escurre y pasa por agua fría para detener la cocción. Esto mantiene el color verde vibrante." },
      { numero:3, titulo:"Saltear con ajo", descripcion:"Calienta el aceite en una sartén o wok a fuego alto. Añade el ajo laminado y saltea 30 segundos." },
      { numero:4, titulo:"Incorporar el brócoli", descripcion:"Agrega el brócoli blanqueado y saltea 3-4 minutos a fuego alto, removiendo constantemente." },
      { numero:5, titulo:"Condimentar y servir", descripcion:"Vierte la salsa de soja, ajusta de sal y pimienta. Si te gusta picante, agrega chile en hojuelas. Sirve de inmediato." },
    ],
  },
  {
    id: 11, nombre:"Tortitas de avena", icon:"🥞", tiempo:"12 min", porciones:"2",
    dificultad:"Fácil", ingredientes:"4 ingredientes", disponible:true, porcentaje:100, categoria:"Desayunos",
    cal:"220 kcal", prot:"10g", gras:"6g", carb:"32g",
    ingredientesList: ["1 taza de avena en hojuelas", "2 huevos", "1 plátano maduro", "1 cdta de canela", "1 cdta de miel (opcional)", "Aceite para cocinar"],
    pasos: [
      { numero:1, titulo:"Preparar la mezcla", descripcion:"Aplasta bien el plátano con un tenedor hasta obtener un puré. Añade los huevos, la avena y la canela. Mezcla hasta obtener una masa homogénea." },
      { numero:2, titulo:"Reposar", descripcion:"Deja reposar la mezcla 5 minutos para que la avena absorba la humedad y las tortitas sean más fáciles de manejar." },
      { numero:3, titulo:"Cocinar", descripcion:"Calienta una sartén antiadherente a fuego medio con unas gotas de aceite. Vierte cucharadas de mezcla y aplana ligeramente." },
      { numero:4, titulo:"Dorar por ambos lados", descripcion:"Cocina 2-3 minutos hasta que aparezcan burbujas en la superficie. Da vuelta y cocina 2 minutos más hasta dorar." },
      { numero:5, titulo:"Servir", descripcion:"Sirve calientes con miel, fruta fresca o yogur. Son perfectas para un desayuno nutritivo." },
    ],
  },
  {
    id: 12, nombre:"Flan de huevo", icon:"🍮", tiempo:"40 min", porciones:"6",
    dificultad:"Media", ingredientes:"3 ingredientes", disponible:true, porcentaje:100, categoria:"Postres",
    cal:"195 kcal", prot:"7g", gras:"6g", carb:"28g",
    ingredientesList: ["6 huevos", "500ml de leche entera", "150g de azúcar (100g para el flan + 50g para el caramelo)", "1 cdta de esencia de vainilla"],
    pasos: [
      { numero:1, titulo:"Hacer el caramelo", descripcion:"Pon 50g de azúcar en un molde al fuego directo a temperatura media. Sin remover, espera que se derrita y tome color dorado. Inclina el molde para que cubra el fondo uniformemente. Reserva." },
      { numero:2, titulo:"Preparar la mezcla", descripcion:"Bate los huevos con 100g de azúcar hasta integrar. Añade la leche tibia poco a poco y la esencia de vainilla. No batir en exceso para evitar burbujas." },
      { numero:3, titulo:"Colar y verter", descripcion:"Pasa la mezcla por un colador fino para eliminar cualquier grumo. Vierte sobre el molde con el caramelo." },
      { numero:4, titulo:"Cocinar al baño María", descripcion:"Coloca el molde dentro de una fuente con agua caliente. Hornea a 170°C durante 40-45 minutos, hasta que al insertar un palillo salga limpio." },
      { numero:5, titulo:"Enfriar y desmoldar", descripcion:"Deja enfriar a temperatura ambiente y luego refrigera al menos 4 horas. Para desmoldar, pasa un cuchillo por los bordes, cubre con un plato y vuelca rápidamente." },
    ],
  },
  {
    id: 15, nombre:"Pasta con ajo y aceite", icon:"🧄", tiempo:"20 min", porciones:"2",
    dificultad:"Fácil", ingredientes:"4 ingredientes", disponible:true, porcentaje:100, categoria:"Pastas",
    cal:"480 kcal", prot:"13g", gras:"18g", carb:"65g",
    ingredientesList: ["250g de spaghetti", "6 dientes de ajo", "5 cdas de aceite de oliva virgen", "Chile en hojuelas al gusto", "Perejil fresco", "Sal y queso parmesano"],
    pasos: [
      { numero:1, titulo:"Cocer la pasta", descripcion:"Hierve abundante agua con sal. Cuece la pasta al dente según el paquete. Reserva 1 taza del agua de cocción antes de escurrir." },
      { numero:2, titulo:"Dorar el ajo", descripcion:"Mientras la pasta se cocina, lamina los ajos finamente. Calienta el aceite en una sartén grande a fuego bajo y añade el ajo. Dora muy suavemente 5 minutos sin que se queme." },
      { numero:3, titulo:"Añadir chile", descripcion:"Agrega las hojuelas de chile al gusto y cocina 1 minuto más para que el aceite tome el sabor." },
      { numero:4, titulo:"Emulsionar la salsa", descripcion:"Añade 3-4 cucharadas del agua de cocción reservada al aceite con ajo. Remueve bien: el almidón del agua ayudará a crear una salsa sedosa." },
      { numero:5, titulo:"Combinar y servir", descripcion:"Añade la pasta escurrida a la sartén y mezcla bien a fuego medio 1 minuto. Sirve con perejil picado y parmesano rallado." },
    ],
  },
  {
    id: 17, nombre:"Tostadas de aguacate", icon:"🥑", tiempo:"10 min", porciones:"2",
    dificultad:"Fácil", ingredientes:"3 ingredientes", disponible:true, porcentaje:100, categoria:"Desayunos",
    cal:"280 kcal", prot:"7g", gras:"18g", carb:"24g",
    ingredientesList: ["2 rebanadas de pan integral", "1 aguacate maduro", "1 limón", "Sal en escamas", "Pimienta negra", "Tomates cherry y huevo (opcional)"],
    pasos: [
      { numero:1, titulo:"Tostar el pan", descripcion:"Tuesta las rebanadas de pan hasta que estén doradas y crujientes." },
      { numero:2, titulo:"Preparar el aguacate", descripcion:"Corta el aguacate por la mitad, retira el hueso y extrae la pulpa. Aplástala con un tenedor en un bol." },
      { numero:3, titulo:"Sazonar", descripcion:"Añade el zumo de medio limón, sal y pimienta al aguacate. Mezcla bien. El limón evita que se oxide y potencia el sabor." },
      { numero:4, titulo:"Armar las tostadas", descripcion:"Extiende el aguacate generosamente sobre cada tostada." },
      { numero:5, titulo:"Terminar y servir", descripcion:"Agrega sal en escamas por encima y opcionalmente tomates cherry cortados o un huevo pochado. Sirve inmediatamente." },
    ],
  },
  {
    id: 20, nombre:"Sopa de tomate", icon:"🍅", tiempo:"25 min", porciones:"4",
    dificultad:"Fácil", ingredientes:"4 ingredientes", disponible:true, porcentaje:100, categoria:"Sopas",
    cal:"110 kcal", prot:"3g", gras:"4g", carb:"16g",
    ingredientesList: ["800g de tomates maduros", "1 cebolla", "2 dientes de ajo", "500ml de caldo de verduras", "2 cdas de aceite de oliva", "Sal, pimienta y albahaca fresca"],
    pasos: [
      { numero:1, titulo:"Sofreír la base", descripcion:"Pica la cebolla y el ajo. Calienta el aceite en una olla y sofríe a fuego medio 5 minutos hasta que estén dorados." },
      { numero:2, titulo:"Añadir los tomates", descripcion:"Corta los tomates en cuartos y añádelos a la olla. Cocina 10 minutos removiendo hasta que se deshagan." },
      { numero:3, titulo:"Añadir el caldo", descripcion:"Vierte el caldo caliente, sazona con sal y pimienta. Lleva a ebullición y cocina 10 minutos más." },
      { numero:4, titulo:"Triturar", descripcion:"Usa una batidora de mano para triturar la sopa hasta obtener una textura cremosa y homogénea." },
      { numero:5, titulo:"Servir", descripcion:"Sirve caliente con hojas de albahaca fresca y un chorrito de aceite de oliva. Acompaña con pan tostado." },
    ],
  },
  {
    id: 21, nombre:"Caldo de verduras", icon:"🥕", tiempo:"30 min", porciones:"4",
    dificultad:"Fácil", ingredientes:"5 ingredientes", disponible:true, porcentaje:100, categoria:"Sopas",
    cal:"60 kcal", prot:"2g", gras:"2g", carb:"9g",
    ingredientesList: ["2 zanahorias", "2 tallos de apio", "1 cebolla", "1 puerro", "3 dientes de ajo", "Laurel, tomillo y perejil", "Sal y pimienta en grano"],
    pasos: [
      { numero:1, titulo:"Preparar las verduras", descripcion:"Lava y trocea toscamente todas las verduras. No hace falta pelarlas si están limpias, las pieles aportan sabor." },
      { numero:2, titulo:"Dorar las verduras", descripcion:"En una olla grande, calienta un poco de aceite y dora ligeramente las verduras 5 minutos removiendo." },
      { numero:3, titulo:"Añadir agua y hierbas", descripcion:"Cubre con 1.5 litros de agua fría. Añade el laurel, tomillo, perejil y pimienta en grano." },
      { numero:4, titulo:"Cocinar a fuego lento", descripcion:"Lleva a ebullición, espuma si es necesario, luego reduce el fuego y cocina 25 minutos a fuego suave." },
      { numero:5, titulo:"Colar y reservar", descripcion:"Cuela el caldo y descarta las verduras. Ajusta de sal. Úsalo de inmediato o guarda en la nevera hasta 5 días." },
    ],
  },
  {
    id: 23, nombre:"Mousse de limón", icon:"🍋", tiempo:"20 min", porciones:"4",
    dificultad:"Media", ingredientes:"4 ingredientes", disponible:true, porcentaje:100, categoria:"Postres",
    cal:"230 kcal", prot:"5g", gras:"14g", carb:"22g",
    ingredientesList: ["3 limones (ralladura y zumo)", "200ml de nata para montar", "3 huevos", "80g de azúcar"],
    pasos: [
      { numero:1, titulo:"Preparar la base de limón", descripcion:"Separa las yemas de las claras. Bate las yemas con el azúcar hasta obtener una mezcla pálida y espumosa. Añade la ralladura y el zumo de limón." },
      { numero:2, titulo:"Montar la nata", descripcion:"Bate la nata fría hasta que esté bien montada (picos firmes). Reserva en el frigorífico." },
      { numero:3, titulo:"Montar las claras", descripcion:"Bate las claras a punto de nieve firme con una pizca de sal." },
      { numero:4, titulo:"Integrar todo", descripcion:"Mezcla suavemente la nata montada con la crema de limón con movimientos envolventes. Luego incorpora las claras a punto de nieve de la misma forma para mantener el aire." },
      { numero:5, titulo:"Refrigerar y servir", descripcion:"Reparte en copas y refrigera al menos 2 horas. Sirve con ralladura de limón y una hoja de menta." },
    ],
  },
  {
    id: 26, nombre:"Arroz con leche", icon:"🍚", tiempo:"30 min", porciones:"4",
    dificultad:"Fácil", ingredientes:"4 ingredientes", disponible:true, porcentaje:100, categoria:"Postres",
    cal:"260 kcal", prot:"6g", gras:"5g", carb:"48g",
    ingredientesList: ["150g de arroz redondo", "1 litro de leche entera", "80g de azúcar", "1 ramita de canela", "Cáscara de 1 limón", "Canela en polvo para decorar"],
    pasos: [
      { numero:1, titulo:"Precocer el arroz", descripcion:"Hierve el arroz en agua durante 5 minutos. Escurre y reserva. Esto ayuda a que suelte el almidón y quede cremoso." },
      { numero:2, titulo:"Cocinar con leche", descripcion:"En una olla, calienta la leche con la canela y la cáscara de limón a fuego medio." },
      { numero:3, titulo:"Añadir el arroz", descripcion:"Cuando la leche esté caliente, incorpora el arroz precocido. Cocina a fuego bajo removiendo frecuentemente." },
      { numero:4, titulo:"Añadir el azúcar", descripcion:"A los 20 minutos, cuando el arroz esté tierno, añade el azúcar y cocina 5 minutos más removiendo constantemente." },
      { numero:5, titulo:"Enfriar y servir", descripcion:"Retira la canela y la cáscara de limón. Sirve caliente o frío, espolvoreado con canela en polvo." },
    ],
  },
  {
    id: 27, nombre:"Limonada natural", icon:"🍋", tiempo:"5 min", porciones:"4",
    dificultad:"Fácil", ingredientes:"3 ingredientes", disponible:true, porcentaje:100, categoria:"Bebidas",
    cal:"60 kcal", prot:"0g", gras:"0g", carb:"16g",
    ingredientesList: ["4 limones", "1 litro de agua fría", "4 cdas de azúcar o miel", "Hielo y hojas de menta (opcional)"],
    pasos: [
      { numero:1, titulo:"Exprimir los limones", descripcion:"Exprime los 4 limones y cuela el zumo para eliminar semillas y pulpa." },
      { numero:2, titulo:"Preparar el almíbar", descripcion:"Disuelve el azúcar en 100ml de agua caliente. Remueve hasta que no queden gránulos. Deja enfriar." },
      { numero:3, titulo:"Mezclar", descripcion:"En una jarra grande, combina el zumo de limón con el almíbar enfriado." },
      { numero:4, titulo:"Añadir agua", descripcion:"Completa con el agua fría y remueve bien. Prueba y ajusta dulzor si es necesario." },
      { numero:5, titulo:"Servir", descripcion:"Sirve sobre hielo con hojas de menta fresca. ¡Refrescante y lista en minutos!" },
    ],
  },
  {
    id: 28, nombre:"Agua de pepino", icon:"🥒", tiempo:"10 min", porciones:"4",
    dificultad:"Fácil", ingredientes:"3 ingredientes", disponible:true, porcentaje:100, categoria:"Bebidas",
    cal:"15 kcal", prot:"0g", gras:"0g", carb:"3g",
    ingredientesList: ["1 pepino", "1 litro de agua fría", "1 limón", "Hojas de menta fresca", "Hielo"],
    pasos: [
      { numero:1, titulo:"Preparar el pepino", descripcion:"Lava bien el pepino. Puedes pelarlo o dejarlo con piel si es orgánico. Córtalo en rodajas finas." },
      { numero:2, titulo:"Cortar el limón", descripcion:"Corta el limón en rodajas finas." },
      { numero:3, titulo:"Infusionar", descripcion:"Coloca las rodajas de pepino y limón en una jarra. Añade las hojas de menta." },
      { numero:4, titulo:"Añadir agua", descripcion:"Vierte el agua fría sobre los ingredientes. Remueve suavemente." },
      { numero:5, titulo:"Reposar y servir", descripcion:"Deja reposar al menos 30 minutos en el frigorífico para que los sabores se integren. Sirve con hielo." },
    ],
  },
  {
    id: 30, nombre:"Té de jengibre", icon:"🫚", tiempo:"10 min", porciones:"2",
    dificultad:"Fácil", ingredientes:"3 ingredientes", disponible:true, porcentaje:100, categoria:"Bebidas",
    cal:"20 kcal", prot:"0g", gras:"0g", carb:"5g",
    ingredientesList: ["5cm de jengibre fresco", "500ml de agua", "1 limón", "Miel al gusto"],
    pasos: [
      { numero:1, titulo:"Preparar el jengibre", descripcion:"Pela el jengibre y córtalo en rodajas finas o rállalo para más sabor." },
      { numero:2, titulo:"Hervir", descripcion:"Lleva el agua a ebullición en un cazo. Añade el jengibre y reduce el fuego." },
      { numero:3, titulo:"Infusionar", descripcion:"Cocina a fuego suave durante 5-7 minutos según la intensidad deseada." },
      { numero:4, titulo:"Colar y servir", descripcion:"Cuela el té para retirar el jengibre. Sirve en tazas." },
      { numero:5, titulo:"Añadir limón y miel", descripcion:"Exprime un poco de limón y endulza con miel al gusto. Bebe caliente para máximo beneficio." },
    ],
  },
  // Recetas no disponibles (sin pasos completos por ahora)
  { id:7,  nombre:"Wrap de pollo",         icon:"🌯", tiempo:"15 min", porciones:"2", dificultad:"Fácil",   ingredientes:"5 ingredientes", disponible:false, porcentaje:80,  categoria:"Pastas",   faltanN:1, cal:"380 kcal", prot:"28g", gras:"12g", carb:"38g", ingredientesList:["Tortilla de trigo","Pechuga de pollo","Lechuga","Tomate","Salsa ranch"], pasos:[] },
  { id:8,  nombre:"Ramen casero",          icon:"🍜", tiempo:"50 min", porciones:"2", dificultad:"Difícil", ingredientes:"8 ingredientes", disponible:false, porcentaje:62,  categoria:"Sopas",    faltanN:3, cal:"520 kcal", prot:"24g", gras:"18g", carb:"62g", ingredientesList:[], pasos:[] },
  { id:10, nombre:"Pasta carbonara",       icon:"🍝", tiempo:"30 min", porciones:"2", dificultad:"Media",   ingredientes:"5 ingredientes", disponible:false, porcentaje:60,  categoria:"Pastas",   faltanN:2, cal:"560 kcal", prot:"22g", gras:"26g", carb:"58g", ingredientesList:[], pasos:[] },
  { id:13, nombre:"Bowl de kale",          icon:"🥬", tiempo:"10 min", porciones:"2", dificultad:"Fácil",   ingredientes:"5 ingredientes", disponible:false, porcentaje:75,  categoria:"Verdes",   faltanN:2, cal:"160 kcal", prot:"6g",  gras:"8g",  carb:"18g", ingredientesList:[], pasos:[] },
  { id:14, nombre:"Pesto casero",          icon:"🌿", tiempo:"10 min", porciones:"4", dificultad:"Fácil",   ingredientes:"5 ingredientes", disponible:false, porcentaje:60,  categoria:"Verdes",   faltanN:3, cal:"220 kcal", prot:"4g",  gras:"20g", carb:"6g",  ingredientesList:[], pasos:[] },
  { id:16, nombre:"Lasaña vegetal",        icon:"🫑", tiempo:"60 min", porciones:"6", dificultad:"Difícil", ingredientes:"8 ingredientes", disponible:false, porcentaje:50,  categoria:"Pastas",   faltanN:4, cal:"420 kcal", prot:"18g", gras:"16g", carb:"52g", ingredientesList:[], pasos:[] },
  { id:18, nombre:"Granola casera",        icon:"🌾", tiempo:"30 min", porciones:"6", dificultad:"Fácil",   ingredientes:"6 ingredientes", disponible:false, porcentaje:66,  categoria:"Desayunos",faltanN:2, cal:"380 kcal", prot:"8g",  gras:"14g", carb:"56g", ingredientesList:[], pasos:[] },
  { id:19, nombre:"Smoothie de frutas",    icon:"🍓", tiempo:"5 min",  porciones:"2", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:false, porcentaje:75,  categoria:"Desayunos",faltanN:1, cal:"180 kcal", prot:"4g",  gras:"2g",  carb:"38g", ingredientesList:[], pasos:[] },
  { id:22, nombre:"Crema de calabaza",     icon:"🎃", tiempo:"35 min", porciones:"4", dificultad:"Media",   ingredientes:"5 ingredientes", disponible:false, porcentaje:60,  categoria:"Sopas",    faltanN:2, cal:"140 kcal", prot:"3g",  gras:"5g",  carb:"22g", ingredientesList:[], pasos:[] },
  { id:24, nombre:"Brownie de chocolate",  icon:"🍫", tiempo:"35 min", porciones:"8", dificultad:"Media",   ingredientes:"6 ingredientes", disponible:false, porcentaje:66,  categoria:"Postres",  faltanN:2, cal:"320 kcal", prot:"4g",  gras:"16g", carb:"42g", ingredientesList:[], pasos:[] },
  { id:25, nombre:"Tarta de manzana",      icon:"🍎", tiempo:"60 min", porciones:"8", dificultad:"Difícil", ingredientes:"7 ingredientes", disponible:false, porcentaje:57,  categoria:"Postres",  faltanN:3, cal:"280 kcal", prot:"3g",  gras:"10g", carb:"46g", ingredientesList:[], pasos:[] },
  { id:29, nombre:"Smoothie verde",        icon:"🥦", tiempo:"5 min",  porciones:"2", dificultad:"Fácil",   ingredientes:"4 ingredientes", disponible:false, porcentaje:75,  categoria:"Bebidas",  faltanN:1, cal:"120 kcal", prot:"4g",  gras:"2g",  carb:"24g", ingredientesList:[], pasos:[] },
  { id:31, nombre:"Jugo de naranja",       icon:"🍊", tiempo:"5 min",  porciones:"2", dificultad:"Fácil",   ingredientes:"2 ingredientes", disponible:false, porcentaje:50,  categoria:"Bebidas",  faltanN:1, cal:"80 kcal",  prot:"1g",  gras:"0g",  carb:"18g", ingredientesList:[], pasos:[] },
  { id:32, nombre:"Batido de plátano",     icon:"🍌", tiempo:"5 min",  porciones:"2", dificultad:"Fácil",   ingredientes:"3 ingredientes", disponible:false, porcentaje:66,  categoria:"Bebidas",  faltanN:1, cal:"160 kcal", prot:"4g",  gras:"2g",  carb:"34g", ingredientesList:[], pasos:[] },
];

export const categorias = [
  { nombre:"Disponibles", emoji:"🥗", count: recetas.filter(r => r.disponible).length },
  { nombre:"Verdes",      emoji:"🥦", count: recetas.filter(r => r.categoria === "Verdes").length },
  { nombre:"Pastas",      emoji:"🍝", count: recetas.filter(r => r.categoria === "Pastas").length },
  { nombre:"Desayunos",   emoji:"🍳", count: recetas.filter(r => r.categoria === "Desayunos").length },
  { nombre:"Sopas",       emoji:"🍲", count: recetas.filter(r => r.categoria === "Sopas").length },
  { nombre:"Postres",     emoji:"🍮", count: recetas.filter(r => r.categoria === "Postres").length },
  { nombre:"Bebidas",     emoji:"🧃", count: recetas.filter(r => r.categoria === "Bebidas").length },
];
