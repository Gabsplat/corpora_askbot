// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/server/supabaseClient";
import { PineconeClient } from "@pinecone-database/pinecone";
const { Configuration, OpenAIApi } = require("openai");

// Open ai
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const EMBEDDING_MODEL = "text-embedding-ada-002";

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
  let queryEmbedding = await openai.createEmbedding({
    model: EMBEDDING_MODEL,
    input: question,
  });

  queryEmbedding = queryEmbedding.data.data[0].embedding;

  console.log("Query embedding", queryEmbedding);

  const { data: documents } = await supabase.rpc("match", {
    query_embedding: queryEmbedding,
    match_threshold: 0.5, // Choose an appropriate threshold for your data
    match_count: 5, // Choose the number of matches
  });

  console.log("documents", documents);

  const context = documents
    .map((document) => {
      return document.title + " " + document.body;
    })
    .join(" ");

  const systemMessage = `Sos un asistente de una compañía llamada Xiaomi, se te hara una pregunta y tienes que responder
  con hechos factuales que se te proveen en el contexto, de la forma más amigable posible. Intenta utilizar el contexto proveído para generar una respuesta más fácil de entender para todo tipo de persona.  Si la respuesta a la pregunta no se puede
  generar con el contexto, entonces responde exactamente (y nada diferente) "Disculpa, no encontré ningun resultado" (sin texto adicional).
  En el caso de que el usuario te pida algo fuera del contexto, responde "Disculpa, sólo puedo responder preguntas relacionadas con el contexto".
  Si pregunta qué puedes hacer, responde qué tareas específicas (con ejemplos) podrías hacer con respecto a los datos del contexto. Cuando digas
  al usuario que puedes responder información sobre el contexto, llamalo "a los datos sobre la Mi Band 4". Ten en cuenta que esto no es un chat,
  simplemente respondes a una pregunta que te hacen y ahí termina la interacción.
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
    vectors: documents,
  };

  return response;
}
