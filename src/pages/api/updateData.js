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
      // console.log("Data:", data, "Length:", data.length);
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

    console.log("Testing connection to Pinecone...");

    for (let i = 0; i < numEntries || i % batchSize !== 0; i += batchSize) {
      // i = 0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320
      const iEnd = Math.min(i + batchSize, numEntries);
      console.log("Testing intermediate...");

      // consigo las 32 próximas líneas (o menos si es el final del array)
      const linesBatch = data.slice(i, iEnd);
      const idsBatch = Array.from({ length: batchSize }, () => uuidv4());

      // convierto párrafos a embeddings
      const input = { input: linesBatch, model: MODEL };
      const res = await openai.createEmbedding(input);
      const embeds = res.data.data.map((record) => record.embedding);

      // creo un objeto con los ids, los embeddings y los metadatos
      const meta = linesBatch.map((line) => ({ text: line }));
      const toUpsert = idsBatch.map((id, j) => {
        return {
          id,
          values: embeds[j],
          metadata: meta[j],
        };
      });
      console.log("toUpsert", toUpsert, toUpsert.length);

      // upsert en pinecone (siempre en batches de 32 o menos)
      const options = {
        method: "POST",
        url: "https://chatbot-66182ac.svc.us-east-1-aws.pinecone.io/vectors/upsert",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "Api-Key": "8bb4bbe6-3c2b-4373-a8d0-dc810e6edd88",
        },
      };
      const response = fetch(options.url, {
        method: options.method,
        headers: options.headers,
        body: JSON.stringify({ vectors: toUpsert }),
      });
      // await index.upsert({ upsertRequest: { vectors: toUpsert } });
      console.log("Upserted batch", i, "to", iEnd);
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
