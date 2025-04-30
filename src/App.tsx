import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './context/ProtectedRoute'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/profile-page'
import ProjectsPage from './pages/ProjectsList'

function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>} />
            <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                     <ProfilePage />
                  </Layout>
                </ProtectedRoute>} />
                <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          </Routes>
        </BrowserRouter>
      </AuthProvider> 
    </ThemeProvider>
 
  )
}

export default App
