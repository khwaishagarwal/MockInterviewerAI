import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import aiFeedbackRoutes from "./routes/aiFeedback.js";
import aiModelRoutes from "./routes/aiModel.js";

// Load environment variables
dotenv.config();

const app = express();

// Allow only Netlify frontend (adjust this if needed)
const allowedOrigins = [
  "https://recroot-ai.tech",
  "https://bs-recroot-ai.netlify.app",
  "http://localhost:3000", // for local dev
];

app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is live");
});

// Use your routes
app.use("/api/ai-feedback", aiFeedbackRoutes);
app.use("/api/ai-model", aiModelRoutes);

// Must listen on process.env.PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
