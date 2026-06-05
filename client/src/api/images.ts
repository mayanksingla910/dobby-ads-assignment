import api from "./axios"

export const uploadImage = (formData: FormData) =>
  api.post("/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data)

export const deleteImage = (id: string) =>
  api.delete(`/images/${id}`).then(r => r.data)