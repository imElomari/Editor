import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './context/ProtectedRoute'

function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider> 
    </ThemeProvider>
 
  )
}

export default App
