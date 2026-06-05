import mongoose, { Document } from "mongoose";

export interface IFolder extends Document {
    name: string;
    owner: mongoose.Types.ObjectId;
    parent: mongoose.Types.ObjectId | null;
    totalSize: number;
}

const folderSchema = new mongoose.Schema<IFolder>(
  {
    name:      { type: String, required: true, trim: true },
    owner:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parent:    { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    totalSize: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Folder = mongoose.model<IFolder>("Folder", folderSchema);
export default Folder;