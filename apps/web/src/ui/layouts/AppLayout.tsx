import { Outlet } from 'react-router'
import { Sidebar } from '@/ui/organisms'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
