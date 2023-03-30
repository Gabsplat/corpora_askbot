const { GoogleSpreadsheet } = require("google-spreadsheet");
import { getParrafosProcesados } from "@/server/utils";
import { PineconeClient } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";
const { Configuration, OpenAIApi } = require("openai");

// Open ai
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
const MODEL = "text-embedding-ada-002";

// Pinecone
const pinecone = new PineconeClient();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const data = await getParrafosProcesados();
      const response = await upsertToPinecone(data);
      res.status(200).json(response);
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

async function upsertToPinecone(data) {
  const batchSize = 32; // process everything in batches of 32
  const numEntries = data.length;

  try {
    await pinecone.init({
      environment: "us-east-1-aws",
      apiKey: "8bb4bbe6-3c2b-4373-a8d0-dc810e6edd88",
    });

    const index = pinecone.Index("chatbot");

    for (let i = 0; i < numEntries || i % batchSize !== 0; i += batchSize) {
      // set end position of batch
      const iEnd = Math.min(i + batchSize, numEntries);

      // get batch of lines and IDs
      const linesBatch = data.slice(i, iEnd);
      const idsBatch = Array.from({ length: batchSize }, () => uuidv4());

      // create embeddings
      const input = { input: linesBatch, model: MODEL };
      const res = await openai.createEmbedding(input);
      const embeds = res.data.data.map((record) => record.embedding);

      // prep metadata and upsert batch
      const meta = linesBatch.map((line) => ({ text: line }));
      const toUpsert = idsBatch.map((id, j) => {
        return {
          id,
          values: embeds[j],
          metadata: meta[j],
        };
      });

      // upsert to Pinecone
      await index.upsert({ upsertRequest: { vectors: toUpsert } });
    }
    return {
      error: false,
      errorMessage: null,
    };
  } catch (err) {
    return {
      error: true,
      errorMessage: err.message,
    };
  }
}
