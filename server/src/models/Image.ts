import mongoose, { Document } from "mongoose";

interface IImage extends Document {
    name: string;
    url: string;
    publicId: string;
    size: number;
    folder: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
}

const imageSchema = new mongoose.Schema<IImage>(
  {
    name:     { type: String, required: true },
    url:      { type: String, required: true },
    publicId: { type: String, required: true },
    size:     { type: Number, required: true },  
    folder:   { type: mongoose.Schema.Types.ObjectId, ref: "Folder", required: true },
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

const Image = mongoose.model<IImage>("Image", imageSchema);
export default Image;