import { Outlet } from 'react-router';
import { Sidebar } from '@/ui/organisms';
import { Toaster } from '@/ui/atoms';

export default function AppLayout() {
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
