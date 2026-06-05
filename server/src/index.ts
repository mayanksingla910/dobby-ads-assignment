import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => res.json({ status: "ok" }));

connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () =>
    console.log(`Server running on port ${process.env.PORT || 8000}`),
  );
});
