const dotenv = require("dotenv");
dotenv.config();

const WebSocket = require("ws");
const { Assistant } = require("./lib/assistant");

const PORT = process.env.PORT || 8000;

const server = new WebSocket.Server({ port: PORT });

const SeferVoiceAssistant = new Assistant(
  `Ты — Sefer AI, мощный голосовой помощник. Основной язык — русский. Если пользователь говорит на украинском — отвечай на украинском. Если на английском — отвечай на английском. Отвечай вежливо, кратко и естественно. Не добавляй никакие префиксы.`,
  {
    speakFirstOpeningMessage: "Привет! Я голосовой помощник Sefer AI. Чем могу помочь?",
    llmModel: "gpt-4o", // або "gpt-3.5-turbo" для економії
    speechToTextModel: "openai/whisper-1",
    voiceModel: "openai/tts-1-hd",
    voiceName: "onyx", // shimmer / nova також доступні
  }
);

server.on("connection", (ws, req) => {
  const cid = req.headers["sec-websocket-key"];
  ws.binaryType = "arraybuffer";

  ws.send(`--- Connected to Sefer AI ---`);

  let demoTimeout;
  if (process.env.IS_DEMO) {
    const timeoutMinutes = 2;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    demoTimeout = setTimeout(() => {
      ws.send("---- FORCED CALL END ----");
      ws.send(`---- Timed out after ${timeoutMinutes} minutes ----`);
      ws.close();
    }, timeoutMs);
  }

  const conversation = SeferVoiceAssistant.createConversation(ws, {
    onEnd: (callLogs) => {
      console.log("----- CALL LOG -----");
      console.log(callLogs);
    },
  });
  conversation.begin(2000);

  ws.on("close", () => {
    clearTimeout(demoTimeout);
    console.log("Client disconnected", cid);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error}`);
  });
});

console.log(`Sefer AI WebSocket server is running on ws://localhost:${PORT}`);
