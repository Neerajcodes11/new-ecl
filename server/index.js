import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { analyze } from './scoring.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const models = JSON.parse(readFileSync(join(__dirname, 'models.json'), 'utf-8'));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/models', (req, res) => {
  const simplified = models.map(m => ({
    id: m.id,
    name: m.name,
    tagline: m.tagline,
    difficulty: m.difficulty,
    description: m.description,
    profitEstimate: m.profitEstimate,
    breakEven: m.breakEven,
    pros: m.pros,
    cons: m.cons
  }));
  res.json(simplified);
});

app.post('/analyze', (req, res) => {
  const { budget, time, skills, risk, revenue } = req.body;

  if (!budget || !time || !skills || !risk || !revenue) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const validBudgets = ['low', 'medium', 'high'];
  const validTimes = ['part-time', 'full-time'];
  const validSkills = ['marketing', 'tech', 'content', 'logistics'];
  const validRisks = ['low', 'medium', 'high'];
  const validRevenues = ['one-time', 'recurring'];

  if (!validBudgets.includes(budget)) return res.status(400).json({ error: 'Invalid budget value' });
  if (!validTimes.includes(time)) return res.status(400).json({ error: 'Invalid time value' });
  if (!Array.isArray(skills) || skills.some(s => !validSkills.includes(s))) {
    return res.status(400).json({ error: 'Invalid skills value' });
  }
  if (!validRisks.includes(risk)) return res.status(400).json({ error: 'Invalid risk value' });
  if (!validRevenues.includes(revenue)) return res.status(400).json({ error: 'Invalid revenue value' });

  const result = analyze({ budget, time, skills, risk, revenue });
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
