import { Router } from "express";
import {
  getRootFolders,
  getFolderById,
  createFolder,
  deleteFolder,
  getAllFolders,
} from "../controllers/folderController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/", getRootFolders);
router.get("/all", getAllFolders);
router.get("/:id", getFolderById);
router.post("/", createFolder);
router.delete("/:id", deleteFolder);

export default router;
