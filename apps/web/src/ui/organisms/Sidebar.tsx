import { NavLink } from 'react-router';
import { BookOpen, Users, BookMarked, Building2, ClipboardList } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/books', icon: BookOpen, label: 'Libros' },
  { to: '/authors', icon: Users, label: 'Autores' },
  { to: '/publishers', icon: Building2, label: 'Editoriales' },
  { to: '/genres', icon: BookMarked, label: 'Géneros' },
  { to: '/audit', icon: ClipboardList, label: 'Auditoría' },
];

export function Sidebar() {
  return (
    <aside className="w-[240px] shrink-0 h-screen flex flex-col justify-between bg-[#2C2416] px-5 py-8">
      {/* Logo */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent shrink-0" />
          <span className="font-serif text-base font-bold text-text-primary-dark">CMPC Libros</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors ${
                  isActive
                    ? 'bg-accent text-white font-semibold'
                    : 'text-text-secondary-dark hover:bg-white/5 hover:text-text-primary-dark'
                }`
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer usuario */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex items-center gap-3 px-1 rounded-lg py-1 transition-colors ${
            isActive ? 'opacity-100' : 'hover:opacity-80'
          }`
        }
      >
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold font-sans">A</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-text-primary-dark text-xs font-semibold font-sans truncate">
            Mi perfil
          </span>
          <span className="text-text-secondary-dark text-[11px] font-sans">Ver cuenta</span>
        </div>
      </NavLink>
    </aside>
  );
}
