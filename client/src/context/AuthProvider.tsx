import { useState } from "react"
import { AuthContext } from "./authContext"
import type { AuthContextType } from "./authContext"

type User = AuthContextType["user"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [user, setUser] = useState<User>(() => {
    const u = localStorage.getItem("user")
    return u ? JSON.parse(u) : null
  })

  const saveAuth = (token: string, user: NonNullable<User>) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}