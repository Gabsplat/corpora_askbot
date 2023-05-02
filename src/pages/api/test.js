const { Configuration, OpenAIApi } = require("openai");

// Open ai
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const EMBEDDING_MODEL = "text-embedding-ada-002";

export default async function handler(req, res) {
  try {
    let queryEmbedding = await openai.createEmbedding({
      model: EMBEDDING_MODEL,
      input: "Test",
    });

    res.status(200).json({ embed: queryEmbedding.data.data[0].embedding });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
