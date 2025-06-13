const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const WebSocket = require("ws");
const { Assistant } = require("./lib/assistant");

const PORT = process.env.PORT || 8000;

// HTTP-сервер (потрібен Render для порту)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Sefer AI is running.");
});

// WebSocket-сервер
const wss = new WebSocket.Server({ server });

const SeferVoiceAssistant = new Assistant(
  `Ты — Sefer AI, мощный голосовой помощник. Основной язык — русский. Если пользователь говорит на украинском — отвечай на украинском. Если на английском — отвечай на английском. Отвечай вежливо, кратко и естественно. Не добавляй никакие префиксы.`,
  {
    speakFirstOpeningMessage: "Привет! Я голосовой помощник Sefer AI. Чем могу помочь?",
    llmModel: "gpt-4o",
    speechToTextModel: "openai/whisper-1",
    voiceModel: "openai/tts-1-hd",
    voiceName: "onyx",
  }
);

wss.on("connection", (ws, req) => {
  const cid = req.headers["sec-websocket-key"];
  ws.binaryType = "arraybuffer";
  ws.send(`--- Connected to Sefer AI ---`);

  const conversation = SeferVoiceAssistant.createConversation(ws, {
    onEnd: (callLogs) => {
      console.log("----- CALL LOG -----");
      console.log(callLogs);
    },
  });
  conversation.begin(2000);

  ws.on("close", () => {
    console.log("Client disconnected", cid);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error}`);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Sefer AI is running on port ${PORT}`);
});
