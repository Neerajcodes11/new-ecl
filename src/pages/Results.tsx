import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft, Trophy, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Clock, Zap, ChevronDown, ChevronUp, BookOpen, BarChart2
} from 'lucide-react';
import type { AnalysisResponse, AnalysisResult } from '../types';
import styles from './Results.module.css';

function riskColor(level: string) {
  if (level === 'Low') return '#10B981';
  if (level === 'Medium') return '#F59E0B';
  return '#EF4444';
}

function difficultyColor(d: string) {
  if (d === 'Easy') return '#10B981';
  if (d === 'Medium') return '#F59E0B';
  return '#EF4444';
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className={styles.scoreWrap}>
      <div className={styles.scoreBar}>
        <div className={styles.scoreFill} style={{ width: `${score}%`, background: color }} />
      </div>
      <span className={styles.scoreNum} style={{ color }}>{score}%</span>
    </div>
  );
}

function ModelCard({
  result,
  isRecommended,
  expanded,
  onToggle,
}: {
  result: AnalysisResult;
  isRecommended: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`${styles.modelCard} ${isRecommended ? styles.recommended : ''}`}>
      {isRecommended && (
        <div className={styles.recommendedBadge}>
          <Trophy size={14} /> Best Match for You
        </div>
      )}

      <div className={styles.cardHeader}>
        <div>
          <div className={styles.modelMeta}>
            <span
              className={styles.diffBadge}
              style={{ color: difficultyColor(result.model.difficulty), background: `${difficultyColor(result.model.difficulty)}18` }}
            >
              {result.model.difficulty}
            </span>
            <span
              className={styles.riskBadge}
              style={{ color: riskColor(result.riskLevel), background: `${riskColor(result.riskLevel)}18` }}
            >
              <AlertTriangle size={11} /> {result.riskLevel} Risk
            </span>
          </div>
          <h3 className={styles.modelName}>{result.model.name}</h3>
          <p className={styles.modelTagline}>{result.model.tagline}</p>
        </div>
        <div className={styles.scoreCircle}>
          <svg viewBox="0 0 36 36" className={styles.svg}>
            <path
              className={styles.svgBg}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={styles.svgFill}
              strokeDasharray={`${result.successScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              style={{ stroke: riskColor(result.riskLevel === 'Low' ? 'Low' : result.successScore >= 60 ? 'Low' : 'Medium') }}
            />
          </svg>
          <span className={styles.circleNum}>{result.successScore}%</span>
          <span className={styles.circleLabel}>Success</span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <TrendingUp size={15} color="var(--brown)" />
          <div>
            <div className={styles.statVal}>{result.profitEstimate.monthly}</div>
            <div className={styles.statLbl}>Monthly Estimate</div>
          </div>
        </div>
        <div className={styles.stat}>
          <Clock size={15} color="var(--brown)" />
          <div>
            <div className={styles.statVal}>{result.breakEven}</div>
            <div className={styles.statLbl}>Break-Even</div>
          </div>
        </div>
        <div className={styles.stat}>
          <Zap size={15} color="var(--brown)" />
          <div>
            <div className={styles.statVal}>{result.profitEstimate.margin}</div>
            <div className={styles.statLbl}>Profit Margin</div>
          </div>
        </div>
      </div>

      <button className={styles.expandBtn} onClick={onToggle}>
        {expanded ? 'Show Less' : 'See Full Details'}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className={styles.expandedContent}>
          <p className={styles.modelDesc}>{result.model.description}</p>

          <div className={styles.twoColGrid}>
            <div>
              <h4 className={styles.subHead}><CheckCircle2 size={15} color="#10B981" /> Pros</h4>
              <ul className={styles.prosList}>
                {result.model.pros.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.subHead}><XCircle size={15} color="#EF4444" /> Cons</h4>
              <ul className={styles.consList}>
                {result.model.cons.map(c => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>

          {result.skillGap.length > 0 && (
            <div className={styles.skillGap}>
              <h4 className={styles.subHead}><BookOpen size={15} color="var(--brown)" /> Skills to Develop</h4>
              <div className={styles.gapTags}>
                {result.skillGap.map(s => (
                  <span key={s} className={styles.gapTag}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {result.aiSuggestions && result.aiSuggestions.length > 0 && (
            <div className={styles.suggestions}>
              <h4 className={styles.subHead}><Zap size={15} color="var(--brown)" /> AI-Powered Suggestions ✨</h4>
              <ul className={styles.suggList}>
                {result.aiSuggestions.map((s, i) => <li key={`ai-${i}`}>{s}</li>)}
              </ul>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <h4 className={styles.subHead}><Zap size={15} color="var(--brown)" /> {result.aiSuggestions ? 'More Tips' : 'Suggestions'}</h4>
              <ul className={styles.suggList}>
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          <div className={styles.steps}>
            <h4 className={styles.subHead}>How to Get Started</h4>
            {result.model.steps.map((s, i) => (
              <div key={i} className={styles.stepRow}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className={styles.investRow}>
            <span>Initial Investment:</span>
            <strong>{result.profitEstimate.initialInvestment}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const nav = useNavigate();
  const state = location.state as { result: AnalysisResponse } | null;
  const [showCompare, setShowCompare] = useState(false);
  const [expandedId, setExpandedId] = useState<string>(state?.result?.recommended?.model?.id || '');

  if (!state?.result) {
    return (
      <div className={styles.noResult}>
        <p>No results found. Please complete the questionnaire first.</p>
        <button className={styles.backBtn} onClick={() => nav('/questionnaire')}>
          <ArrowLeft size={16} /> Go to Questionnaire
        </button>
      </div>
    );
  }

  const { recommended, alternatives, all } = state.result;
  const displayList = showCompare ? all : [recommended, ...alternatives];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => nav('/questionnaire')}>
            <ArrowLeft size={16} /> Redo Analysis
          </button>
          <button className={styles.compareBtn} onClick={() => setShowCompare(s => !s)}>
            <BarChart2 size={16} />
            {showCompare ? 'Show Summary' : 'Compare All Models'}
          </button>
        </div>

        <div className={styles.header}>
          <div className={styles.headerBadge}>Analysis Complete</div>
          <h1 className={styles.title}>Your Perfect Match: <span className={styles.accent}>{recommended.model.name}</span></h1>
          <p className={styles.subtitle}>
            Based on your profile, here's how each E-commerce model fits you.
            Your best match scores <strong>{recommended.successScore}%</strong> — great starting point!
          </p>
        </div>

        {showCompare && (
          <div className={styles.compareTable}>
            <h2 className={styles.compareTitle}>Model Comparison</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Success Score</th>
                    <th>Risk Level</th>
                    <th>Difficulty</th>
                    <th>Monthly Est.</th>
                    <th>Break-Even</th>
                  </tr>
                </thead>
                <tbody>
                  {all.map(r => (
                    <tr key={r.model.id} className={r.model.id === recommended.model.id ? styles.highlightRow : ''}>
                      <td>
                        <strong>{r.model.name}</strong>
                        {r.model.id === recommended.model.id && <span className={styles.bestTag}>Best</span>}
                      </td>
                      <td>
                        <ScoreBar score={r.successScore} />
                      </td>
                      <td>
                        <span style={{ color: riskColor(r.riskLevel) }}>{r.riskLevel}</span>
                      </td>
                      <td>
                        <span style={{ color: difficultyColor(r.model.difficulty) }}>{r.model.difficulty}</span>
                      </td>
                      <td>{r.profitEstimate.monthly}</td>
                      <td>{r.breakEven}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className={styles.cardList}>
          {displayList.map(result => (
            <ModelCard
              key={result.model.id}
              result={result}
              isRecommended={result.model.id === recommended.model.id}
              expanded={expandedId === result.model.id}
              onToggle={() => setExpandedId(prev => prev === result.model.id ? '' : result.model.id)}
            />
          ))}
        </div>

        <div className={styles.footerNote}>
          <p>These recommendations are based on general patterns for first-time E-commerce entrepreneurs in India. Results are for guidance only.</p>
          <button className={styles.primaryBtn} onClick={() => nav('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
