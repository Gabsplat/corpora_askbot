// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PineconeClient } from "@pinecone-database/pinecone";
const { Configuration, OpenAIApi } = require("openai");

// Open ai
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
const EMBEDDING_MODEL = "text-embedding-ada-002";

// Pinecone
const pinecone = new PineconeClient();

export default async function handler(req, res) {
  await pinecone.init({
    environment: "us-east-1-aws",
    apiKey: "8bb4bbe6-3c2b-4373-a8d0-dc810e6edd88",
  });

  const index = pinecone.Index("chatbot");

  let query = "Quién es tu creador?";
  let query2 = "Dame ejemplos de tareas que puedas hacer";

  let xq = await openai.createEmbedding({
    model: EMBEDDING_MODEL,
    input: query,
  });

  xq = xq.data.data[0].embedding;

  const matchingVectors = await index.query({
    queryRequest: {
      topK: 10,
      includeValues: true,
      includeMetadata: true,
      vector: xq,
    },
  });

  const context = matchingVectors.matches
    .map((match) => match.metadata.text)
    .join(" ");

  const systemMessage = `Sos un asistente de una compañía constructora, se te hara una pregunta y tienes que responder 
  con hechos factuales que se te proveen en el contexto, de una forma concisa. Si la respuesta a la pregunta no se puede 
  generar con el contexto, entonces responde exactamente (y nada diferente) "Disculpa, no encontré ningun resultado" (sin texto adicional).
  En el caso de que el usuario te pida algo fuera del contexto, responde "Disculpa, sólo puedo responder preguntas relacionadas con el contexto".
  Si pregunta qué puedes hacer, responde qué tareas específicas (con ejemplos) podrías hacer con respecto a los datos del contexto.
  
  Contexto:
  ${context}
  `;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: query },
    ],
  });

  const chatBotResponse1 = completion.data.choices[0].message.content;

  res.status(200).json({
    succ: "success",
    chatBotResponse1,
  });
}
