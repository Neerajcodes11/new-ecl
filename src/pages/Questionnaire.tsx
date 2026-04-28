import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { FormData } from '../types';
import { analyzeForm } from '../api';
import styles from './Questionnaire.module.css';

const steps = [
  {
    id: 'budget',
    question: 'What is your starting budget?',
    hint: 'This helps us find models that fit your financial situation.',
    type: 'single',
    options: [
      { value: 'low', label: 'Low', sub: 'Under ₹50,000', emoji: '💰' },
      { value: 'medium', label: 'Medium', sub: '₹50,000 – ₹2 Lakh', emoji: '💳' },
      { value: 'high', label: 'High', sub: '₹2 Lakh – ₹5 Lakh', emoji: '🏦' },
    ],
  },
  {
    id: 'time',
    question: 'How much time can you dedicate?',
    hint: 'Be honest — some models need daily attention, others are flexible.',
    type: 'single',
    options: [
      { value: 'part-time', label: 'Part-Time', sub: '2–4 hours/day', emoji: '⏰' },
      { value: 'full-time', label: 'Full-Time', sub: '6–8 hours/day', emoji: '🕗' },
    ],
  },
  {
    id: 'skills',
    question: 'Which skills do you already have?',
    hint: 'Select all that apply. No skill? That\'s okay too — just skip.',
    type: 'multi',
    options: [
      { value: 'marketing', label: 'Marketing', sub: 'Ads, social media, promotions', emoji: '📢' },
      { value: 'tech', label: 'Tech', sub: 'Websites, tools, coding', emoji: '💻' },
      { value: 'content', label: 'Content', sub: 'Writing, videos, photos', emoji: '✍️' },
      { value: 'logistics', label: 'Logistics', sub: 'Shipping, inventory, supply', emoji: '📦' },
    ],
  },
  {
    id: 'risk',
    question: 'How comfortable are you with risk?',
    hint: 'Higher risk can mean higher reward, but also more chance of loss.',
    type: 'single',
    options: [
      { value: 'low', label: 'Play it Safe', sub: 'I want minimal risk', emoji: '🛡️' },
      { value: 'medium', label: 'Balanced', sub: 'Some risk is okay', emoji: '⚖️' },
      { value: 'high', label: 'Go All In', sub: 'I can handle volatility', emoji: '🚀' },
    ],
  },
  {
    id: 'revenue',
    question: 'What type of revenue do you prefer?',
    hint: 'Both are valid — it depends on your patience and business style.',
    type: 'single',
    options: [
      { value: 'one-time', label: 'One-Time Sales', sub: 'Earn per transaction', emoji: '💵' },
      { value: 'recurring', label: 'Recurring Income', sub: 'Monthly subscriptions', emoji: '🔄' },
    ],
  },
];

const defaultForm: FormData = {
  budget: 'low',
  time: 'part-time',
  skills: [],
  risk: 'low',
  revenue: 'one-time',
};

export default function Questionnaire() {
  const nav = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormData>({ ...defaultForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const step = steps[currentStep];

  function handleSingle(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleMulti(value: string) {
    setForm(prev => {
      const arr = prev.skills as string[];
      return {
        ...prev,
        skills: arr.includes(value) ? arr.filter(s => s !== value) : [...arr, value],
      };
    });
  }

  type FormRecord = Record<string, string | string[]>;

  function isSelected(stepId: string, value: string) {
    if (stepId === 'skills') return form.skills.includes(value);
    return (form as unknown as FormRecord)[stepId] === value;
  }

  function canProceed() {
    if (step.id === 'skills') return true;
    return isSelected(step.id, (form as unknown as FormRecord)[step.id] as string);
  }

  async function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setLoading(true);
      setError('');
      try {
        const result = await analyzeForm(form);
        nav('/results', { state: { result, form } });
      } catch {
        setError('Could not connect to the server. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => currentStep > 0 ? setCurrentStep(s => s - 1) : nav('/')}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round((currentStep + 1) / steps.length * 100)}% complete</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(currentStep + 1) / steps.length * 100}%` }} />
          </div>
          <div className={styles.stepDots}>
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`${styles.dot} ${i < currentStep ? styles.dotDone : ''} ${i === currentStep ? styles.dotActive : ''}`}
              >
                {i < currentStep ? <CheckCircle2 size={14} /> : i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.questionHeader}>
            <h2 className={styles.question}>{step.question}</h2>
            <p className={styles.hint}>{step.hint}</p>
          </div>

          <div className={`${styles.options} ${step.options.length === 2 ? styles.twoCol : styles.threeCol}`}>
            {step.options.map(opt => (
              <button
                key={opt.value}
                className={`${styles.option} ${isSelected(step.id, opt.value) ? styles.optionSelected : ''}`}
                onClick={() =>
                  step.type === 'multi'
                    ? handleMulti(opt.value)
                    : handleSingle(step.id as keyof FormData, opt.value)
                }
              >
                <span className={styles.optionEmoji}>{opt.emoji}</span>
                <span className={styles.optionLabel}>{opt.label}</span>
                <span className={styles.optionSub}>{opt.sub}</span>
                {isSelected(step.id, opt.value) && (
                  <span className={styles.checkIcon}><CheckCircle2 size={18} /></span>
                )}
              </button>
            ))}
          </div>

          {step.type === 'multi' && form.skills.length === 0 && (
            <p className={styles.skipNote}>No skills yet? No problem — just click "Next" and we'll suggest what to learn.</p>
          )}

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={loading || (!canProceed() && step.type !== 'multi')}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : currentStep < steps.length - 1 ? (
              <>Next Step <ArrowRight size={18} /></>
            ) : (
              <>Get My Results <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
