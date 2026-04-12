const axios = require("axios");

const textToSpeech = async (req, res) => {
  try {
    const { text, lang = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    if (text.length > 200) {
      return res.status(400).json({ message: "Text must be 200 characters or less" });
    }

    // Map lang to TTSMP3 codes
    const langMap = {
      'en': 'eng',
      'es': 'spa',
      'fr': 'fre',
      'de': 'ger',
      'it': 'ita',
      'pt': 'por',
      'ru': 'rus',
      'ja': 'jpn',
      'ko': 'kor',
      'zh-CN': 'chi',
      'ar': 'ara',
      'hi': 'hin'
    };
    const ttsLang = langMap[lang] || 'eng';

    const url = `https://ttsmp3.com/makemp3.php?msg=${encodeURIComponent(text)}&lang=${ttsLang}&source=ttsmp3`;

    const response = await axios.get(url);
    const data = response.data;

    if (data.Error !== 0) {
      return res.status(500).json({ message: "TTS API error", error: data });
    }

    // Fetch the audio URL
    const audioResponse = await axios({
      method: "GET",
      url: data.URL,
      responseType: "arraybuffer"
    });

    // Convert to base64
    const audioBase64 = Buffer.from(audioResponse.data).toString("base64");

    res.status(200).json({
      message: "TTS successful",
      audio: audioBase64
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      message: "Error converting text to speech",
      error: error.message
    });
  }
};

module.exports = { textToSpeech };