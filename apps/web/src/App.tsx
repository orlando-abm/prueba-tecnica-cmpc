import { BrowserRouter, Route, Routes, Navigate } from 'react-router'
import LoginPage from './pages/login/LoginPage'
import AppLayout from './ui/layouts/AppLayout'
import GenresPage from './pages/genres/GenresPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/genres" replace />} />
          <Route path="/genres" element={<GenresPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
