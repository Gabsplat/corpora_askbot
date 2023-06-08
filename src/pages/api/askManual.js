// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PineconeClient } from "@pinecone-database/pinecone";
const { Configuration, OpenAIApi } = require("openai");

// Open ai
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const EMBEDDING_MODEL = "text-embedding-ada-002";

// Pinecone
const pinecone = new PineconeClient();

export default async function handler(req, res) {
  const { method } = req;
  switch (method) {
    case "POST":
      const question = req.body.question;
      const { botResponse, vectors } = await makeQuestion(question);
      res.status(200).json({ botResponse, vectors });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

async function makeQuestion(question) {
  // Init pinecone
  await pinecone.init({
    environment: "us-west4-gcp",
    apiKey: process.env.PINECONE_API_KEY,
  });

  // Set pinecone index
  const index = pinecone.Index("manualcolonial");

  let queryEmbedding = await openai.createEmbedding({
    model: EMBEDDING_MODEL,
    input: question,
  });

  queryEmbedding = queryEmbedding.data.data[0].embedding;

  const matchingVectors = await index.query({
    queryRequest: {
      topK: 3,
      includeValues: true,
      includeMetadata: true,
      vector: queryEmbedding,
    },
  });

  const matchingVectorsValues = matchingVectors.matches.map(
    (match) => match.metadata.text
  );

  const context = matchingVectorsValues.join(" ");

  const systemMessage = `Sos una persona Senior especializada en procesos de una compañía constructora llamada Colonial, se te hara una pregunta y tienes que responder
  lo mejor posible para que un interno entienda los procesos de la empresa, con la información proveída por el contexto. Si, además de responder preguntas, se te pide
  hacer tareas deberás hacerlas pero sólo si tienen que ver con el contexto de Colonial.  Si la respuesta a la pregunta no es clara, entonces responde exactamente 
  "Disculpa, lamentablemente no encontré ninguna referencia a tu pregunta en el manual." (sin texto adicional).
  En el caso de que el usuario te pida algo fuera del contexto, responde "Disculpa, sólo puedo responder preguntas relacionadas con el manual de Colonial".
  Ten en cuenta que esto no es un chat, simplemente respondes y ahí termina la interacción.
  Contexto:
  ${context}
  `;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: question },
    ],
  });

  const chatBotResponse1 = completion.data.choices[0].message.content;

  const response = {
    botResponse: chatBotResponse1,
    vectors: matchingVectorsValues,
  };

  return response;
}
