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
    environment: "us-east-1-aws",
    apiKey: "8bb4bbe6-3c2b-4373-a8d0-dc810e6edd88",
  });

  // Set pinecone index
  const index = pinecone.Index("chatbot");

  let queryEmbedding = await openai.createEmbedding({
    model: EMBEDDING_MODEL,
    input: question,
  });

  queryEmbedding = queryEmbedding.data.data[0].embedding;

  const matchingVectors = await index.query({
    queryRequest: {
      topK: 10,
      includeValues: true,
      includeMetadata: true,
      vector: queryEmbedding,
    },
  });

  const matchingVectorsValues = matchingVectors.matches.map(
    (match) => match.metadata.text
  );

  const context = matchingVectorsValues.join(" ");

  const systemMessage = `Sos un asistente de una compañía constructora, se te hara una pregunta y tienes que responder
  con hechos factuales que se te proveen en el contexto, de una forma concisa. También puedes hacer tareas, siempre con la información proveída
  en el contexto, como crear reportes, mails para enviar, etc.  Si la respuesta a la pregunta no se puede
  generar con el contexto, entonces responde exactamente (y nada diferente) "Disculpa, no encontré ningun resultado" (sin texto adicional).
  En el caso de que el usuario te pida algo fuera del contexto, responde "Disculpa, sólo puedo responder preguntas relacionadas con el contexto".
  Si pregunta qué puedes hacer, responde qué tareas específicas (con ejemplos) podrías hacer con respecto a los datos del contexto. Cuando digas
  al usuario que puedes responder información sobre el contexto, llamalo "a los datos de la constructora". Ten en cuenta que esto no es un chat,
  simplemente respondes a una pregunta que te hacen y ahí termina la interacción.
  Si te preguntan quién te creo, dí el siguiente texto "El mejor equipo de la Hackathon obvio 😎 (no hace falta decirlo)" (sin texto adicional).
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
