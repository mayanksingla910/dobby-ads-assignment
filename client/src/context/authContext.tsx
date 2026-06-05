import { createContext } from "react"

type User = { id: string; name: string; email: string }

export type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  saveAuth: (token: string, user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)