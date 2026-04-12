const express = require('express');
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
});