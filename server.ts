import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for AI Chat
  app.post("/api/chat", async (req, res) => {
    const { messages, subject } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are an expert AI study assistant for students. 
Your name is "Study AI". You help students understand concepts clearly.
Current subject context: ${subject || "General Study"}
Rules:
- Explain in simple Roman Urdu mixed with English
- Use examples students can relate to
- Break complex topics into simple steps
- Be encouraging and supportive
- Format answers with bullet points when listing multiple items
- Keep responses clear and educational`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            ...messages.map((m: { role: string; content: string }) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            }))
        ],
        config: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      });

      res.json({ response: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      // If it's a 503, return a more specific message
      if ((error as any)?.status === 503) {
        return res.status(503).json({ error: "AI service temporarily busy. Please try again in a moment." });
      }
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
