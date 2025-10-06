import fs from "fs";

import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
let store;

export const initSupportBot = async () => {
  try {
    const data = JSON.parse(fs.readFileSync("knowledge.json", "utf-8"));

    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2", // ONNX-compatible
    });

    store = await MemoryVectorStore.fromTexts(
      data.map((d) => d.question),
      data.map((d) => ({ answer: d.answer })),
      embeddings
    );

    console.log("✅ SupportBot knowledge base initialized (Gemini)!");
  } catch (err) {
    console.error("❌ Error initializing SupportBot (Gemini):", err);
  }
};
// controller for user queries
export const askSupportBot = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question)
      return res.status(400).json({ error: "Question is required" });

    if (!store)
      return res.status(500).json({ error: "SupportBot not initialized" });

    const result = await store.similaritySearch(question, 1);
    const bestMatch = result[0].metadata.answer;

    res.json({ answer: bestMatch });
  } catch (err) {
    console.error("SupportBot error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
