import { createBrowserRouter, RouterProvider } from "react-router-dom"
import AuthLayout from "./pages/auth/authLayout"
import { Login } from "./pages/auth/login"
import { Signup } from "./pages/auth/signup"
import { Toaster } from "sonner"
import { AuthProvider } from "./context/AuthProvider"
import Dashboard from "./pages/Dashboard/Dashboard"
import DashboardLayout from "./pages/Dashboard/DashboardLayout"
import FolderPage from "./pages/Dashboard/FolderPage"
import { ProtectedRoute } from "./components/protected-route"

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
  {
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { path: "/", element: <Dashboard /> },
        { path: "/folder/:id", element: <FolderPage /> },
      ],
    },
  ],
}
])

export function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  )
}

export default App
