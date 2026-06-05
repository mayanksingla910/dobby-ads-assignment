import { createBrowserRouter, RouterProvider } from "react-router-dom"
import AuthLayout from "./pages/auth/authLayout"
import { Login } from "./pages/auth/login"
import { Signup } from "./pages/auth/signup"
import { Toaster } from "sonner"
import { AuthProvider } from "./context/AuthProvider"

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
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
