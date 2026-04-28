import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit';
import { analyze } from './scoring.js';
import { getAiSuggestions } from './ai.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load models once, with error handling ──────────────────────────────────
let models;
try {
  models = JSON.parse(readFileSync(join(__dirname, 'models.json'), 'utf-8'));
  console.log(`✅ Loaded ${models.length} business models`);
} catch (err) {
  console.error('❌ Failed to load models.json:', err.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS — allow Vite dev server and configurable origins ──────────────────
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json({ limit: '50kb' }));

// ── Rate limiting ──────────────────────────────────────────────────────────
const analyzeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,             // 15 requests per minute per IP
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    models: models.length,
    ai: !!process.env.GROQ_API_KEY,
    uptime: Math.floor(process.uptime()),
  });
});

// ── GET /models — return simplified model list ─────────────────────────────
app.get('/models', (_req, res) => {
  const simplified = models.map(m => ({
    id: m.id,
    name: m.name,
    tagline: m.tagline,
    difficulty: m.difficulty,
    description: m.description,
    profitEstimate: m.profitEstimate,
    breakEven: m.breakEven,
    pros: m.pros,
    cons: m.cons,
  }));
  res.json(simplified);
});

// ── POST /analyze — score models + optional AI suggestions ─────────────────
app.post('/analyze', analyzeRateLimiter, async (req, res) => {
  const { budget, time, skills, risk, revenue } = req.body;

  // ── Validation ──
  if (!budget || !time || !risk || !revenue) {
    return res.status(400).json({ error: 'All fields are required (budget, time, skills, risk, revenue)' });
  }
  if (skills === undefined || skills === null || !Array.isArray(skills)) {
    return res.status(400).json({ error: 'Skills must be an array (can be empty)' });
  }

  const validBudgets = ['low', 'medium', 'high'];
  const validTimes = ['part-time', 'full-time'];
  const validSkills = ['marketing', 'tech', 'content', 'logistics'];
  const validRisks = ['low', 'medium', 'high'];
  const validRevenues = ['one-time', 'recurring'];

  if (!validBudgets.includes(budget)) return res.status(400).json({ error: 'Invalid budget value' });
  if (!validTimes.includes(time)) return res.status(400).json({ error: 'Invalid time value' });
  if (skills.length > 0 && skills.some(s => !validSkills.includes(s))) {
    return res.status(400).json({ error: 'Invalid skills value' });
  }
  if (!validRisks.includes(risk)) return res.status(400).json({ error: 'Invalid risk value' });
  if (!validRevenues.includes(revenue)) return res.status(400).json({ error: 'Invalid revenue value' });

  // ── Run scoring engine (models passed in, not re-read) ──
  const result = analyze({ budget, time, skills, risk, revenue }, models);

  // ── Enhance with AI suggestions if Groq key is available ──
  if (process.env.GROQ_API_KEY) {
    try {
      const aiSuggestions = await getAiSuggestions(
        result.recommended.model,
        { budget, time, skills, risk, revenue },
        result.recommended.skillGap
      );
      if (aiSuggestions && aiSuggestions.length > 0) {
        result.recommended.aiSuggestions = aiSuggestions;
      }
    } catch (err) {
      console.error('AI enhancement failed, using base suggestions:', err.message);
      // Non-fatal — base suggestions still returned
    }
  }

  res.json(result);
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   AI Suggestions: ${process.env.GROQ_API_KEY ? 'Enabled (Groq)' : 'Disabled (no GROQ_API_KEY)'}`);
});
