import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth" 
import { Loader2 } from "lucide-react"

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}