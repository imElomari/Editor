import { AuthProvider } from "./context/AuthContext"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import { ThemeProvider } from "./context/ThemeContext"
import ProtectedRoute from "./context/ProtectedRoute"
import Layout from "./pages/Layout"
import Dashboard from "./pages/Dashboard"
import ProfilePage from "./pages/profile-page"
import ProjectsPage from "./pages/ProjectsList"
import LabelsPage from "./pages/LabelsList"
import EditorPage from "./pages/EditorPage"
import ProjectDetails from "./pages/ProjectDetails"
import TrashPage from "./pages/TrashPage"
import AssetsPage from "./pages/AssetsPage"
// Replace the Toaster import and usage with our enhanced SonnerProvider
import { SonnerProvider } from "./components/ui/sonner-provider"
import { LoadingTranslations } from "./components/LoadingTranslations"
import { useTranslation } from "react-i18next"

function App() {
    const { i18n } = useTranslation();
  
  return (
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen">  
    <LoadingTranslations>
    <ThemeProvider>
      <AuthProvider>
        <SonnerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
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
              <Route
                path="/labels"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <LabelsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assets"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AssetsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editor/:labelId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EditorPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:projectId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectDetails />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trash"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TrashPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </SonnerProvider>
      </AuthProvider>
    </ThemeProvider>
    </LoadingTranslations>
  </div>  
  )
}

export default App
