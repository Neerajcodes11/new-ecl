/**
 * Scoring engine for e-commerce model recommendations.
 * Models data is injected via the analyze() function — no duplicate file reads.
 */

function calculateScore(model, userInput) {
  const { budget, time, skills, risk, revenue } = userInput;
  const s = model.scoring;

  let score = 0;
  score += (s.budget[budget] || 0);
  score += (s.time[time] || 0);

  // Skill scoring: blend of best skill match + average across selected skills
  const skillScores = skills.map(skill => s.skills[skill] || 0);
  const topSkillScore = skillScores.length > 0 ? Math.max(...skillScores) : 0;
  const avgSkillScore = skillScores.length > 0
    ? skillScores.reduce((a, b) => a + b, 0) / skillScores.length
    : 0;
  const actualSkillScore = Math.round((topSkillScore + avgSkillScore) / 2);
  score += actualSkillScore;

  score += (s.risk[risk] || 0);
  score += (s.revenue[revenue] || 0);

  // maxPossible must mirror the SAME skill formula used above.
  // Best case: user picks the single highest-scoring skill → top = max, avg = max → blend = max.
  const maxSkillValue = Math.max(...Object.values(s.skills));
  const maxPossible =
    Math.max(...Object.values(s.budget)) +
    Math.max(...Object.values(s.time)) +
    maxSkillValue +  // mirrors the best-case blend: (max + max) / 2 = max
    Math.max(...Object.values(s.risk)) +
    Math.max(...Object.values(s.revenue));

  // Cap at 95% — a perfect 100% implies guaranteed success, which is misleading
  const rawPercent = Math.round((score / maxPossible) * 100);
  const successScore = Math.min(95, Math.max(0, rawPercent));
  return successScore;
}

function getRiskLevel(successScore, risk) {
  // High score + user wants low risk → genuinely low risk
  if (successScore >= 70 && risk === 'low') return 'Low';
  // Decent score with any risk preference → medium
  if (successScore >= 50 && (risk === 'low' || risk === 'medium')) return 'Medium';
  // Low score overrides user's preference — it's objectively risky
  if (successScore >= 50 && risk === 'high') return 'Medium';
  return 'High';
}

function getSkillGap(model, userSkills) {
  const required = model.requirements.skills;
  return required.filter(s => !userSkills.includes(s));
}

function getBaseSuggestions(model, skillGap, budget, time) {
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

/**
 * Main analysis function.
 * @param {Object} userInput - { budget, time, skills, risk, revenue }
 * @param {Array} models - The models data array (passed in, not re-read from disk)
 * @returns {Object} - { recommended, alternatives, all }
 */
export function analyze(userInput, models) {
  const results = models.map(model => {
    const successScore = calculateScore(model, userInput);
    const riskLevel = getRiskLevel(successScore, userInput.risk);
    const skillGap = getSkillGap(model, userInput.skills);
    const suggestions = getBaseSuggestions(model, skillGap, userInput.budget, userInput.time);

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
