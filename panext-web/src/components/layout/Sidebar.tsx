"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";

const navItems = [
  { label:"Inicio",           href:"/",               icon:"🏠", section:"principal" },
  { label:"Lista de Compras", href:"/compras",         icon:"🛒", section:"principal" },
  { label:"Recetas",          href:"/recetas",         icon:"🍽️", section:"principal" },
  { label:"Inventario",       href:"/inventario",      icon:"📦", section:"principal" },
  { label:"Receta con IA",    href:"/recetas/ia",      icon:"✨", section:"herramientas" },
  { label:"Notificaciones",   href:"/notificaciones",  icon:"🔔", section:"herramientas", notifBadge:true },
];

export default function Sidebar() {
  const pathname             = usePathname();
  const { user, logout }     = useAuth();
  const { unreadCount, urgentCount } = useNotif();

  const principal    = navItems.filter(i => i.section === "principal");
  const herramientas = navItems.filter(i => i.section === "herramientas");

  const avatarChar = user?.displayName?.[0]?.toUpperCase();
  const avatarPhoto = user?.photoURL;

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 flex flex-col z-40 shadow-card">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-display text-xl font-bold text-gray-800">Pan-Ext</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Principal</p>
        <ul className="space-y-0.5 mb-5">
          {principal.map(item => (
            <NavLink key={item.href} item={item} active={
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            } badge={0} />
          ))}
        </ul>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Herramientas</p>
        <ul className="space-y-0.5">
          {herramientas.map(item => (
            <NavLink key={item.href} item={item}
              active={pathname.startsWith(item.href)}
              badge={item.notifBadge ? unreadCount : 0}
              urgent={item.notifBadge ? urgentCount > 0 : false}
            />
          ))}
        </ul>
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-100">
        <Link href="/perfil" className="p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-green-soft flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
            {avatarPhoto
              ? <img src={avatarPhoto} alt="avatar" className="w-full h-full object-cover" />
              : <span className="font-semibold text-green-dark">{avatarChar ?? "👤"}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.displayName ?? "Usuario"}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red hover:bg-red/5 transition-colors border-t border-gray-100">
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item, active, badge, urgent }: {
  item: typeof navItems[0];
  active: boolean;
  badge: number;
  urgent?: boolean;
}) {
  return (
    <li>
      <Link href={item.href}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          active ? "bg-green-soft text-green-dark font-semibold" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}>
        <span className="text-base">{item.icon}</span>
        <span className="flex-1 truncate">{item.label}</span>
        {badge > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${urgent ? "bg-red" : "bg-orange"}`}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </Link>
    </li>
  );
}
