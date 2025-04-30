import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './context/ProtectedRoute'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/profile-page'
import ProjectsPage from './pages/ProjectsList'
import LabelsPage from './pages/LabelsList'
import EditorPage from './pages/EditorPage'
import ProjectDetails from './pages/ProjectDetails'

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
                </ProtectedRoute>} 
            />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </ProtectedRoute>} 
             />
             <Route path="/labels" element={
              <ProtectedRoute>
                <Layout>
                  <LabelsPage />
                </Layout>
              </ProtectedRoute>} 
             />
             <Route path="/editor/:labelId" element={
              <ProtectedRoute>
                <Layout>
                  <EditorPage />
                </Layout>
              </ProtectedRoute>
            } />
             <Route path="/projects/:projectId" element={
              <ProtectedRoute>
                <Layout>
                  <ProjectDetails />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider> 
    </ThemeProvider>
 
  )
}

export default App
