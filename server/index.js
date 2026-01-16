// server/index.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Check API key at startup
const apiKey =
  process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/recommend", async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!apiKey) {
    console.error("OpenRouter API key not found in environment variables");
    return res.status(500).json({
      error: "API key configuration error",
    });
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/devstral-2512:free",
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    }
  );

  const data = await response.json();

  // Check for errors in the response
  if (data.error) {
    console.error("OpenRouter API error:", data.error);
    return res.status(data.error.code || 500).json({
      error: data.error.message || "AI service error",
    });
  }

  console.log(data);
  res.json({
    reply: data.choices?.[0]?.message?.content || "Received no response.",
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenRouter API key ${apiKey ? "found" : "NOT FOUND"}`);
});
