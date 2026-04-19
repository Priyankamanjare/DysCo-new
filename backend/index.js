const express = require('express');
const https = require('https');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const rootEnvPath = path.resolve(__dirname, '../../.env');
dotenv.config();
dotenv.config({ path: rootEnvPath });

const connectDB = require("./config/connectDB");
const userRoutes = require("./routes/userRoutes");
const summaryRoutes = require('./routes/summaryRoutes');
const textToSpeechRoutes = require('./routes/textToSpeechRoutes');
const speechToTextRoutes = require('./routes/speechToTextRoutes');
const cardRoutes = require('./routes/cardRoutes');
const noteRoutes = require('./routes/noteRoutes');
const quizRoutes = require('./routes/quizRoutes');const gameProgressRoutes = require("./routes/gameProgressRoutes");
dotenv.config();

// ✅ Use fallback port
const PORT = process.env.PORT || 5000;

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Connect DB
connectDB();

// ✅ Test Route
app.get("/", (req, res) => {
    res.send("Welcome to the lexilearn server");
});

// ✅ Health Check (keeps Render server alive)
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// ✅ API Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/summary", summaryRoutes);
app.use("/api/v1/texttospeech", textToSpeechRoutes);
app.use("/api/v1/speechtotext", speechToTextRoutes);
app.use("/api/v1/card", cardRoutes);
app.use("/api/v1/note", noteRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/progress", gameProgressRoutes);

// ✅ Server Start
app.listen(PORT, () => {
    console.log(`Server started at Port: ${PORT}`);

    // ✅ Self-ping every 14 minutes to prevent Render free-tier sleep
    const RENDER_URL = process.env.RENDER_URL; // e.g. https://your-app.onrender.com
    if (RENDER_URL) {
        setInterval(() => {
            https.get(`${RENDER_URL}/health`, (res) => {
                console.log(`[Keep-alive] Health ping status: ${res.statusCode}`);
            }).on('error', (err) => {
                console.error('[Keep-alive] Ping failed:', err.message);
            });
        }, 14 * 60 * 1000); // every 14 minutes
        console.log(`[Keep-alive] Self-ping enabled → ${RENDER_URL}/health`);
    }
});