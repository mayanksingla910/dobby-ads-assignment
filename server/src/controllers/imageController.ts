import { Response } from "express"
import { v2 as cloudinary } from "cloudinary"
import Image from "../models/Image"
import Folder from "../models/Folder"
import { AuthRequest } from "../middleware/authMiddleware"
import { updateAncestorSizes } from "./folderController"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    const { name, folderId } = req.body
    if (!name || !folderId) {
      return res.status(400).json({ message: "Name and folderId are required" })
    }

    const folder = await Folder.findOne({ _id: folderId, owner: req.user!._id })
    if (!folder) return res.status(404).json({ message: "Folder not found" })

    if (!req.file) return res.status(400).json({ message: "Image is required" })

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "dobby-ads",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    })

    const image = await Image.create({
      name,
      url: result.secure_url,
      publicId: result.public_id,
      size: req.file.size,
      folder: folderId,
      owner: req.user!._id,
    })

    await updateAncestorSizes(folderId, req.file.size)

    res.status(201).json({ image })
  } catch (err) {
    console.error("Upload error:", err)
    res.status(500).json({ message: "Server error" })
  }
}

export const deleteImage = async (req: AuthRequest, res: Response) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, owner: req.user!._id })
    if (!image) return res.status(404).json({ message: "Image not found" })

    await cloudinary.uploader.destroy(image.publicId)

    await updateAncestorSizes(image.folder.toString(), -image.size)

    await image.deleteOne()

    res.json({ message: "Image deleted" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}