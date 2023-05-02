const { GoogleSpreadsheet } = require("google-spreadsheet");
import { supabase } from "@/server/supabaseClient";
import { PineconeClient } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";
const { Configuration, OpenAIApi } = require("openai");

// Open ai
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
const MODEL = "text-embedding-ada-002";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const data = getParrafosProcesados();
      // console.log("Data:", data, "Length:", data.length);
      const response = await upsertToSupabase(data);
      res.status(200).json(response);
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

function getParrafosProcesados() {
  const paragraphs = [
    {
      title: "Descripción general del producto",
      body: "La MiBand4 cuenta con pantalla táctil, botón táctil, sensor de frecuencia cardíaca y puerto de carga.",
    },
    {
      title: "Instalación",
      body: "Para instalar la MiBand4 primero, inserte un extremo del medidor de actividad en la ranura de la parte delantera de la pulsera. Segundo, presione hacia abajo en el otro extremo con el pulgar para encajar el medidor de actividad completamente en la ranura.",
    },
    {
      title: "Colocación",
      body: "Para colocarse la MiBand4 apriete la banda alrededor de la muñeca, de forma cómoda, dejando una distancia de aproximadamente un dedo hasta el hueso de la muñeca. Nota: Llevar muy suelta la pulsera puede afectar a la recopilación de datos del pulsómetro.",
    },
    {
      title: "Conectandose",
      body: "Para conectar el teléfono (smartphone) con la MiBand4, escanee el código QR para descargar e instalar la última versión de la aplicación Mi Fit, o búsquelo en Google Play, App Store u otras tiendas de aplicaciones de terceros. Luego, abra la aplicación Mi Fit, inicie sesión en su cuenta y, a continuación, siga las instrucciones para conectar y vincular la pulsera con su dispositivo. Cuando su pulsera empiece a vibrar y aparezca una notificación de vinculación de Bluetooth en la pantalla, toque el botón para completar el proceso de vinculación con su dispositivo. Nota: Asegúrese de que está habilitado el Bluetooth en su teléfono. Mantenga cerca el teléfono de la pulsera durante el proceso de vinculación.",
    },
    {
      title: "Uso",
      body: "Para usar la MiBand4: Tras haberse vinculado con éxito con su dispositivo, la pulsera comenzará a seguir y analizar sus actividades diarias y hábitos de sueño. Toque el botón para iluminar la pantalla. A continuación, deslice hacia arriba o hacia abajo para acceder a las diferentes funciones. Deslice hacia la derecha para regresar a la página anterior.",
    },
    {
      title: "Desmontaje",
      body: "Para desmontar la MiBand4, quítese la pulsera de la muñeca. Sujétela por ambos extremos y estire la pulsera hasta que vea un pequeño hueco entre el medidor de actividad y la pulsera. Use un dedo para sacar el medidor de actividad de la ranura por el lado frontal de la pulsera.",
    },
    {
      title: "Carga",
      body: "Recargue su pulsera inmediatamente cuando el nivel de batería sea bajo.",
    },
    {
      title: "Precauciones",
      body: "Las precauciones de la MiBand4 son: Cuando use la pulsera para medir su ritmo cardíaco, mantenga firme la muñeca. Mi Smart Band 4 tiene una clasificación de resistencia al agua de 5 ATM. Se puede llevar en la ducha, en la piscina o mientras nada cerca de la orilla. Sin embargo, no debe usarse en una sauna ni para bucear. La función de botón táctil y pantalla táctil no está disponible bajo el agua. Cuando su pulsera entre en contacto con el agua, utilice un paño suave para eliminar el exceso de agua de su superficie antes de usarla. Durante el uso cotidiano evite ajustar demasiado fuerte la pulsera en la muñeca e intente mantener seca su superficie de contacto.Limpie la pulsera periódicamente con agua.Si la superficie de contacto de su piel muestra señales de enrojecimiento o hinchazón, deje de utilizar inmediatamente el producto y busque asistencia médica.",
    },
    {
      title: "Especificaciones",
      body: "Las especificaciones son: Nombre: Mi Smart Band 4; Modelo: XMSH07HM; Peso neto del medidor de actividad: 10,6g; Dimensiones del medidor de actividad: 46,8 x 17,8 x 12,6 mm; Material de la pulsera: Elastómero termoplástico; Material del cierre: Aleación de aluminio; Longitud ajustable: 155–216 mm; Compatible con: Android 4.4 e iOS 9.0 o superior; Capacidad de la batería: 135 mAh; Tipo de batería: Batería de polímero de litio; Tensión de entrada: DC 5.0 V; Corriente de entrada: 250 mA Max.; Clasificación IP: 5 ATM; Frecuencia: 2402–2480 MHz; Salida máxima: 0 dBm; Temperatura de funcionamiento: -10°C ~ 50°C; Conectividad inalámbrica: Bluetooth 5.0 BLE;",
    },
  ];
  return paragraphs;
}

async function upsertToSupabase(data) {
  data.forEach(async ({ title, body }) => {
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: body,
    });
    const embedding = embeddingResponse.data.data[0].embedding;
    const { data, error } = await supabase.from("posts").insert({
      title,
      body,
      embedding,
    });
    if (error) console.log("Error upserting paragraph:", error);
  });
}
