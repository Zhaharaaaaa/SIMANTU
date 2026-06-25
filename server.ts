import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client lazily to avoid crashing if API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes FIRST so Vite middleware does not capture them
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, systemInstruction } = req.body;
    
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getAiClient();
    
    // history format from client-side should match: Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }>
    const formattedHistory = Array.isArray(history) ? history : [];
    
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash"
    ];
    let responseText = "";
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.info(`Attempting generateContent using model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            ...formattedHistory,
            { role: "user", parts: [{ text: message }] }
          ],
          config: {
            systemInstruction: systemInstruction || "You are SIMANTU AI Assistant, a highly versatile, helpful, and friendly expert helper. While you are integrated into the SIMANTU Business Intelligence Dashboard (Sistem Pemantauan Perubahan Status Sosial), you are fully capable of answering ANY topic, question, or general query the user asks, including general knowledge, technical coding, recipe advice, languages, math, science, and overall assistant tasks. Do not restrict yourself to only SIMANTU platform questions. Always provide highly intelligent, clear, polite, and practical answers in Indonesian (or the language requested by the user) and remain friendly and helpful."
          }
        });
        
        if (response && response.text) {
          responseText = response.text;
          break; // Success! Exit the loop
        }
      } catch (err: any) {
        console.info(`Model ${modelName} fallback check. Details:`, err.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      // Return a refined Indonesian message instead of a generic backend dump
      const is503 = lastError?.message?.includes("503") || lastError?.status === 503;
      const errorMsgDetails = is503 
        ? "Server sedang mengalami lalu lintas data yang sangat padat (High Demand). Silakan kirim ulang pesan Anda beberapa detik lagi."
        : (lastError?.message || "Semua model AI saat ini sedang tidak tersedia.");
      throw new Error(errorMsgDetails);
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini AI API Error after fallbacks:", error);
    res.status(500).json({ 
      error: error.message || "Terjadi kesalahan internal pada layanan Asisten AI."
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
