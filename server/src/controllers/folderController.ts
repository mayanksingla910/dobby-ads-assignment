import { Response } from "express";
import Folder, { IFolder } from "../models/Folder";
import Image from "../models/Image";
import { AuthRequest } from "../middleware/authMiddleware";

export const getRootFolders = async (req: AuthRequest, res: Response) => {
  try {
    const folders = await Folder.find({ owner: req.user!._id, parent: null });
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getFolderById = async (req: AuthRequest, res: Response) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user!._id,
    });
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const subfolders = await Folder.find({
      parent: folder._id,
      owner: req.user!._id,
    });
    const images = await Image.find({
      folder: folder._id,
      owner: req.user!._id,
    });
    const breadcrumb = await buildBreadcrumb(folder._id.toString());

    res.json({ folder, subfolders, images, breadcrumb });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllFolders = async (req: AuthRequest, res: Response) => {
  try {
    const folders = await Folder.find({ owner: req.user!._id }).sort({
      name: 1,
    });
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createFolder = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    if (parentId) {
      const parent = await Folder.findOne({
        _id: parentId,
        owner: req.user!._id,
      });
      if (!parent)
        return res.status(404).json({ message: "Parent folder not found" });
    }

    const folder = await Folder.create({
      name,
      owner: req.user!._id,
      parent: parentId || null,
    });

    res.status(201).json({ folder });
  } catch (err: any) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "A folder with this name already exists here" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFolder = async (req: AuthRequest, res: Response) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user!._id,
    });
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    await deleteFolderRecursive(
      folder._id.toString(),
      req.user!._id.toString(),
    );

    res.json({ message: "Folder deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const buildBreadcrumb = async (folderId: string) => {
  const crumbs: { id: string; name: string }[] = [];
  let current = await Folder.findById(folderId);

  while (current) {
    crumbs.unshift({ id: current._id.toString(), name: current.name });
    current = current.parent ? await Folder.findById(current.parent) : null;
  }

  return crumbs;
};

const deleteFolderRecursive = async (folderId: string, ownerId: string) => {
  await Image.deleteMany({ folder: folderId, owner: ownerId });

  const subfolders = await Folder.find({ parent: folderId, owner: ownerId });
  for (const sub of subfolders) {
    await deleteFolderRecursive(sub._id.toString(), ownerId);
  }

  await Folder.findByIdAndDelete(folderId);
};

export const updateAncestorSizes = async (
  folderId: string,
  sizeChange: number,
) => {
  let currentId: string | null = folderId;

  while (currentId) {
    await Folder.findByIdAndUpdate(currentId, {
      $inc: { totalSize: sizeChange },
    });
    const folder: IFolder | null = await Folder.findById(currentId).exec();
    currentId = folder?.parent?.toString() ?? null;
  }
};
