import { useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/ui/organisms';
import { Toaster } from '@/ui/atoms';
import { useAuthStore } from '@/store/auth.store';

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-bg-light border-b border-border-light px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif text-sm font-bold text-text-primary">CMPC Libros</span>
        </div>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
