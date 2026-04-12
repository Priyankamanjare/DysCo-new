const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');
const Note = require('../models/noteModel');
const Quiz = require('../models/quizModel');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
const hf = new HfInference(HF_API_KEY);

console.log('QuizController loaded, HF_API_KEY present:', Boolean(HF_API_KEY));

const extractJSON = (text) => {
  if (!text || typeof text !== 'string') return null;

  const jsonMatch = text.match(/(\[|\{)([\s\S]*)(\]|\})/);
  const candidate = jsonMatch ? jsonMatch[0] : text;

  try {
    return JSON.parse(candidate);
  } catch (error) {
    const cleaned = candidate
      .replace(/```/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\n\s*\n/g, '\n')
      .replace(/,\s*([\]}])/g, '$1')
      .replace(/\[(\s*\])/, '[]')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (secondError) {
      return null;
    }
  }
};

const normalizeOption = (option) => {
  if (!option) return null;
  if (typeof option === 'string') {
    return { text: option.trim(), isCorrect: false };
  }
  return {
    text: option.text?.toString().trim() || option.toString().trim(),
    isCorrect: Boolean(option.isCorrect)
  };
};

const buildQuizPrompt = (note, questionCount, quizType) => {
  const safeContent = note.content?.trim() || '';
  const content = safeContent.length > 3000 ? safeContent.slice(0, 3000) : safeContent;

  const base = quizType === 'summary-comprehension'
    ? `You are an expert educator. Generate ${questionCount} challenging comprehension questions from the note content below. Focus on higher-order thinking, inference, and application. Use the note text to create questions that test understanding of the ideas, not rote memorization.`
    : `You are an expert exam setter. Generate ${questionCount} HIGH-QUALITY multiple-choice questions from the note content below. Focus on important concepts, avoid simple word-definition questions, and include why/how/application reasoning. Provide four answer choices each, with one correct answer.`;

  return `${base}\n\nReturn valid JSON only in the following format:\n[\n  {\n    "question": "",\n    "options": [\n      {"text": "", "isCorrect": true},\n      {"text": "", "isCorrect": false},\n      {"text": "", "isCorrect": false},\n      {"text": "", "isCorrect": false}\n    ],\n    "correctAnswer": "",\n    "difficulty": "easy|medium|hard",\n    "explanation": ""\n  }\n]\n\nContent:\n${content}`;
};

const createNoteQuiz = async (req, res) => {
  try {
    const userId = req.user;
    const { noteId, quizType = 'multiple-choice', questionCount = 5 } = req.body;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const count = Math.max(1, Math.min(20, Number(questionCount) || 5));
    const prompt = buildQuizPrompt(note, count, quizType);

    if (!HF_API_KEY || HF_API_KEY.length < 20) {
      return res.status(500).json({ message: 'HF service key is missing or invalid' });
    }

    const response = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert exam setter. Return only valid JSON, with no extra text or markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });

    const rawText = response.choices?.[0]?.message?.content || '';
    const parsed = extractJSON(rawText);

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return res.status(500).json({
        message: 'AI did not return a valid quiz format',
        details: rawText
      });
    }

    const questions = parsed.map((item, index) => {
      const options = Array.isArray(item.options)
        ? item.options.map(normalizeOption).filter(Boolean)
        : [];

      return {
        type: 'multiple-choice',
        question: item.question?.toString().trim() || `Question ${index + 1}`,
        options,
        correctAnswer: item.correctAnswer?.toString().trim() || options.find((opt) => opt.isCorrect)?.text || '',
        explanation: item.explanation?.toString().trim() || '',
        difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty?.toString().toLowerCase())
          ? item.difficulty.toString().toLowerCase()
          : 'medium'
      };
    });

    const quiz = new Quiz({
      userId,
      noteId: note._id,
      quizType,
      title: `${note.title} Quiz`,
      description: `Quiz generated from note: ${note.title}`,
      content: note.content || '',
      summary: note.content?.slice(0, 300),
      questions,
      totalQuestions: questions.length
    });

    await quiz.save();

    return res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Quiz Creation Error:', error.message || error);
    const status = error.response?.status;
    if (status === 401 || status === 403 || (error.message && error.message.includes('Unauthorized'))) {
      return res.status(500).json({
        message: 'HF API key invalid or unauthorized',
        error: error.message || 'Unauthorized'
      });
    }
    if (status === 429 || (error.message && (error.message.includes('Rate limit') || error.message.includes('quota')))) {
      return res.status(429).json({
        message: 'HF rate limit or quota exceeded.',
        error: error.message || 'Rate limited'
      });
    }
    return res.status(500).json({
      message: 'Error generating quiz',
      error: error.response?.data?.message || error.message || 'Unknown error',
      details: error.response?.data || null
    });
  }
};

const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.userId.toString() !== req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(200).json({ quiz });
  } catch (error) {
    console.error('Get Quiz Error:', error.message || error);
    return res.status(500).json({ message: 'Error fetching quiz', error: error.message || 'Unknown error' });
  }
};

const getUserQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user }).sort({ createdAt: -1 });
    return res.status(200).json({ quizzes });
  } catch (error) {
    console.error('Get User Quizzes Error:', error.message || error);
    return res.status(500).json({ message: 'Error fetching quizzes', error: error.message || 'Unknown error' });
  }
};

const submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'quizId and answers are required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.userId.toString() !== req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;
    const detailedResults = [];

    quiz.questions.forEach((question, index) => {
      const answer = answers[index];
      const normalizedAnswer = answer ? answer.toString().trim().toLowerCase() : '';
      const normalizedCorrect = question.correctAnswer ? question.correctAnswer.toString().trim().toLowerCase() : '';
      
      const isCorrect = answer ? (normalizedAnswer === normalizedCorrect) : false;
      
      if (isCorrect) {
        correctAnswers += 1;
      }

      detailedResults.push({
        questionIndex: index,
        question: question.question,
        userAnswer: answer || '',
        isCorrect,
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || ''
      });
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;

    quiz.attempts += 1;
    quiz.lastScore = score;
    quiz.bestScore = Math.max(quiz.bestScore || 0, score);
    quiz.history.push({
      score,
      correctAnswers,
      totalQuestions,
      passed,
      date: new Date()
    });

    await quiz.save();

    return res.status(200).json({
      message: 'Quiz submitted successfully',
      score,
      correctAnswers,
      totalQuestions,
      passed,
      results: detailedResults
    });
  } catch (error) {
    console.error('Submit Quiz Error:', error.message || error);
    return res.status(500).json({ message: 'Error submitting quiz', error: error.message || 'Unknown error' });
  }
};

module.exports = {
  createNoteQuiz,
  submitQuizAnswers,
  getQuiz,
  getUserQuizzes
};
