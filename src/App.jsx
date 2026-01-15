import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import Calendar from './pages/Calendar'
import './index.css'

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Rutas Protegidas bajo Layout */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/calendar" element={<Calendar />} />
                        {/* Otras rutas internas se añadirían aquí */}
                    </Route>

                    {/* Ruta de No Autorizado */}
                    <Route
                        path="/unauthorized"
                        element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>403 - No tienes permiso para acceder a esta página.</h1></div>}
                    />

                    {/* 404 Not Found */}
                    <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>404 - Página no encontrada.</h1></div>} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App
