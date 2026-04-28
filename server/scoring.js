import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const models = JSON.parse(readFileSync(join(__dirname, 'models.json'), 'utf-8'));

function calculateScore(model, userInput) {
  const { budget, time, skills, risk, revenue } = userInput;
  const s = model.scoring;

  let score = 0;
  score += (s.budget[budget] || 0);
  score += (s.time[time] || 0);

  const skillScores = skills.map(skill => s.skills[skill] || 0);
  const topSkillScore = skillScores.length > 0 ? Math.max(...skillScores) : 0;
  const avgSkillScore = skillScores.length > 0
    ? skillScores.reduce((a, b) => a + b, 0) / skillScores.length
    : 0;
  score += Math.round((topSkillScore + avgSkillScore) / 2);

  score += (s.risk[risk] || 0);
  score += (s.revenue[revenue] || 0);

  const maxPossible =
    Math.max(...Object.values(s.budget)) +
    Math.max(...Object.values(s.time)) +
    Math.max(...Object.values(s.skills)) +
    Math.max(...Object.values(s.risk)) +
    Math.max(...Object.values(s.revenue));

  const successScore = Math.min(100, Math.round((score / maxPossible) * 100));
  return successScore;
}

function getRiskLevel(successScore, budget, risk) {
  if (successScore >= 70 && risk === 'low') return 'Low';
  if (successScore >= 50 || risk === 'medium') return 'Medium';
  return 'High';
}

function getSkillGap(model, userSkills) {
  const required = model.requirements.skills;
  return required.filter(s => !userSkills.includes(s));
}

function getSuggestions(model, skillGap, budget, time) {
  const tips = [];

  if (skillGap.includes('marketing')) {
    tips.push('Take a free digital marketing course on Google Skillshop or YouTube');
  }
  if (skillGap.includes('content')) {
    tips.push('Practice writing product reviews or short-form videos on Instagram Reels');
  }
  if (skillGap.includes('tech')) {
    tips.push('Learn basics of Shopify or WordPress with free tutorials on YouTube');
  }
  if (skillGap.includes('logistics')) {
    tips.push('Partner with a local courier service or use Shiprocket for easy logistics');
  }

  if (budget === 'low' && model.id === 'subscription') {
    tips.push('Start with a micro-subscription (10–20 subscribers) to test demand before scaling');
  }
  if (time === 'part-time' && model.id === 'subscription') {
    tips.push('Automate order processing with tools like Subbly or Cratejoy to save time');
  }

  tips.push(`Join online communities like r/${model.id === 'affiliate' ? 'affiliatemarketing' : 'ecommerce'} to learn from others`);
  tips.push('Start small, validate your idea with 5–10 customers before investing heavily');

  return tips.slice(0, 4);
}

export function analyze(userInput) {
  const results = models.map(model => {
    const successScore = calculateScore(model, userInput);
    const riskLevel = getRiskLevel(successScore, userInput.budget, userInput.risk);
    const skillGap = getSkillGap(model, userInput.skills);
    const suggestions = getSuggestions(model, skillGap, userInput.budget, userInput.time);

    return {
      model: {
        id: model.id,
        name: model.name,
        tagline: model.tagline,
        difficulty: model.difficulty,
        description: model.description,
        pros: model.pros,
        cons: model.cons,
        steps: model.steps
      },
      successScore,
      riskLevel,
      skillGap,
      suggestions,
      profitEstimate: model.profitEstimate,
      breakEven: model.breakEven
    };
  });

  results.sort((a, b) => b.successScore - a.successScore);

  return {
    recommended: results[0],
    alternatives: results.slice(1),
    all: results
  };
}
