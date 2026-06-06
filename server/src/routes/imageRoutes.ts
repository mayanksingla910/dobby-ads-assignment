import { Router } from "express"
import { uploadImage, deleteImage, renameImage } from "../controllers/imageController"
import { protect } from "../middleware/authMiddleware"
import multer from "multer"

const upload = multer({ dest: "uploads/" })

const router = Router()

router.use(protect)

router.post("/", upload.single("image"), uploadImage)
router.delete("/:id", deleteImage)
router.patch("/:id/rename", renameImage)

export default router