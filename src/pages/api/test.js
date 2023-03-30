const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Sos un botazo bro, equipo de Corpora." },
        { role: "user", content: "De qué equipo formas parte?" },
      ],
    });
    res.status(200).json(completion.data.choices[0].message.content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
