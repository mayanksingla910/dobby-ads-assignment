import api from "./axios"

export const signupApi = async (data: {
  name: string
  email: string
  password: string
}) => {
  const res = await api.post("/auth/signup", data)
  return res.data
}

export const loginApi = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data)
  return res.data
}

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me")
  return res.data
}