import { NavLink } from 'react-router';
import { BookOpen, Users, BookMarked, Building2, ClipboardList, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/books', icon: BookOpen, label: 'Libros' },
  { to: '/authors', icon: Users, label: 'Autores' },
  { to: '/publishers', icon: Building2, label: 'Editoriales' },
  { to: '/genres', icon: BookMarked, label: 'Géneros' },
  { to: '/audit', icon: ClipboardList, label: 'Auditoría' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-[240px] flex flex-col justify-between bg-[#2C2416] px-5 py-8 transition-transform duration-200
          md:static md:translate-x-0 md:shrink-0 md:h-screen
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-accent shrink-0" />
              <span className="font-serif text-base font-bold text-text-primary-dark">CMPC Libros</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="md:hidden text-text-secondary-dark hover:text-text-primary-dark p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
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
          onClick={onClose}
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
    </>
  );
}
