import { useState, useEffect } from "react"
import { AuthContext } from "./authContext"
import type { AuthContextType } from "./authContext"
import { getCurrentUser } from "@/api/auth"

type User = AuthContextType["user"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  )
  const [user, setUser] = useState<User>(() => {
    const u = localStorage.getItem("user")
    return u ? JSON.parse(u) : null
  })
  const [loading, setLoading] = useState(true)

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const freshUserData = await getCurrentUser()

        localStorage.setItem("user", JSON.stringify(freshUserData))
        setUser(freshUserData)
      } catch (error) {
        console.error("Session verification failed. Logging out...", error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [])

  const saveAuth = (token: string, user: NonNullable<User>) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
