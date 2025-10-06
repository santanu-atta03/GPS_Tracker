import fs from "fs";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

let store = null;

export const initSupportBot = async () => {
  const data = JSON.parse(fs.readFileSync("knowledge.json", "utf-8"));

  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2",
  });

  store = await MemoryVectorStore.fromTexts(
    data.map((d) => d.question),
    data.map((d) => ({ answer: d.answer })),
    embeddings
  );
  console.log("✅ SupportBot knowledge base initialized!");
};

export const askSupportBot = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question)
      return res.status(400).json({ error: "Question is required" });

    // 👇 Initialize lazily if store is missing
    if (!store) {
      console.log("⚙️ Reinitializing SupportBot...");
      await initSupportBot();
    }

    const result = await store.similaritySearch(question, 1);
    const bestMatch = result[0].metadata.answer;

    res.json({ answer: bestMatch });
  } catch (err) {
    console.error("SupportBot error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
