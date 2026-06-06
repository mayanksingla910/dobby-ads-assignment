import api from "./axios"

export const getRootFolders = () => api.get("/folders").then((r) => r.data)

export const getFolderById = (id: string) =>
  api.get(`/folders/${id}`).then((r) => r.data)

export const getAllFolders = () => api.get("/folders/all").then((r) => r.data)

export const createFolder = (name: string, parentId?: string) =>
  api.post("/folders", { name, parentId }).then((r) => r.data)

export const deleteFolder = (id: string) =>
  api.delete(`/folders/${id}`).then((r) => r.data)

export const renameFolder = (id: string, name: string) =>
  api.patch(`/folders/${id}/rename`, { name }).then((r) => r.data)
