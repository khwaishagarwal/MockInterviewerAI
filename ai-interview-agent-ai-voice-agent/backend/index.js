import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import aiFeedbackRoutes from "./routes/aiFeedback.js";
import aiModelRoutes from "./routes/aiModel.js";

// Load environment variables
dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = [
  "https://recroot-ai.tech",
  "https://bs-recroot-ai.netlify.app",
  "http://localhost:3000",
];

// CORS middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Parse JSON body
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`, req.body);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is live");
});

// Routes
app.use("/api/ai-feedback", aiFeedbackRoutes);
app.use("/api/ai-model", aiModelRoutes);

// Listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});