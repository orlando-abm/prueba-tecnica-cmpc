import { Outlet, Navigate } from 'react-router';
import { Sidebar } from '@/ui/organisms';
import { Toaster } from '@/ui/atoms';
import { useAuthStore } from '@/store/auth.store';

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
