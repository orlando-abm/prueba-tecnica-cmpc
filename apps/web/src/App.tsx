import { BrowserRouter, Route, Routes } from 'react-router'
import LoginPage from './pages/login/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}
