const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Local summarization fallback (works without external API)
const localSummarize = (text) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const targetSentences = Math.max(1, Math.ceil(sentences.length / 3));
  
  // Score sentences by keyword frequency
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const scoredSentences = sentences.map((sent, idx) => ({
    text: sent.trim(),
    score: sent.split(/\b\w+\b/g).reduce((sum, word) => sum + (wordFreq[word.toLowerCase()] || 0), 0),
    idx
  }));
  
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, targetSentences)
    .sort((a, b) => a.idx - b.idx)
    .map(s => s.text)
    .join(' ');
  
  return topSentences || text.substring(0, Math.floor(text.length / 3));
};

const summarizeText = async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: 'Text content is required'
      });
    }

    if (text.trim().length < 50) {
      return res.status(400).json({
        message: 'Text must be at least 50 characters long'
      });
    }

    const maxLength = 5000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    let summary;
    let source = 'local';

    // Try Cohere API first if key is available
    if (COHERE_API_KEY && COHERE_API_KEY.length > 20) {
      try {
        console.log('Attempting Cohere API...');
        const response = await axios.post(
          'https://api.cohere.ai/v1/chat',
          {
            model: 'command-r',
            message: `Summarize this text to one-third of its length, keeping key ideas:\n\n${truncatedText}`
          },
          {
            headers: {
              'Authorization': `Bearer ${COHERE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );

        summary = response.data?.text;
        if (summary && summary.trim().length > 0) {
          source = 'cohere';
          console.log('Cohere API success');
        }
      } catch (apiError) {
        console.log('Cohere API failed:', apiError?.response?.data?.message || apiError.message);
        console.log('Falling back to local summarization...');
      }
    }

    // Fallback to local summarization
    if (!summary) {
      summary = localSummarize(truncatedText);
      source = 'local';
      console.log('Using local summarization');
    }

    if (!summary || summary.trim().length === 0) {
      return res.status(500).json({
        message: 'Error in text summarization',
        details: 'Summarization failed'
      });
    }

    return res.status(200).json({
      message: 'Text Summarization Successful',
      summary: summary.trim(),
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: ((summary.length / text.length) * 100).toFixed(2) + '%',
      language: language,
      source: source
    });

  } catch (error) {
    console.error('Summarization Error:', error.message);
    res.status(500).json({
      message: 'Error summarizing text',
      error: error?.message || 'Unknown error occurred'
    });
  }
};

module.exports = {
  summarizeText,
};
