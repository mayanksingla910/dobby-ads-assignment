import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import folderRoutes from "./routes/folderRoutes";
import imageRoutes from "./routes/imageRoutes";
import mcpRouter from "./mcp/mcpRouter";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/images", imageRoutes);

app.use("/mcp", mcpRouter);

app.get("/", (_req, res) => res.json({ status: "ok" }));

connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () =>
    console.log(`Server running on port ${process.env.PORT || 8000}`),
  );
});
