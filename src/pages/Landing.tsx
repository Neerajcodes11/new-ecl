import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, TrendingUp, Shield, Users } from 'lucide-react';
import styles from './Landing.module.css';

const features = [
  { icon: Lightbulb, title: 'Smart Matching', desc: 'We match your profile to the best E-commerce model using intelligent scoring.' },
  { icon: TrendingUp, title: 'Profit Estimates', desc: 'Get realistic income projections tailored for the Indian market.' },
  { icon: Shield, title: 'Risk Analysis', desc: 'Understand your risk exposure before spending a single rupee.' },
  { icon: Users, title: 'Beginner-First', desc: 'No jargon. No complexity. Just clear, actionable guidance.' },
];

const steps = [
  { num: '01', title: 'Answer 5 quick questions', desc: 'Tell us your budget, time, skills, and goals. Takes under 2 minutes.' },
  { num: '02', title: 'Get your personalized match', desc: 'Our system scores every model against your profile and picks the best fit.' },
  { num: '03', title: 'Start your journey', desc: 'Follow our step-by-step guide to launch your first E-commerce business.' },
];

export default function Landing() {
  const nav = useNavigate();

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🚀</span>
            <span className={styles.logoText}>StartupPlanner</span>
          </div>
          <button className={styles.navCta} onClick={() => nav('/questionnaire')}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>Free for First-Time Entrepreneurs</div>
        <h1 className={styles.heroTitle}>
          Find Your Perfect<br />
          <span className={styles.heroAccent}>E-Commerce Model</span>
        </h1>
        <p className={styles.heroDesc}>
          Not sure how to start your online business? Answer 5 simple questions and we'll recommend
          the best E-commerce model for your budget, skills, and goals.
        </p>
        <div className={styles.heroCtas}>
          <button className={styles.primaryBtn} onClick={() => nav('/questionnaire')}>
            Find My Model <ArrowRight size={18} />
          </button>
          <p className={styles.heroNote}>No sign-up required · Budget under ₹5 Lakh · Beginner-friendly</p>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>3</span>
            <span className={styles.statLabel}>Business Models</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>₹0</span>
            <span className={styles.statLabel}>Cost to Analyze</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>2 min</span>
            <span className={styles.statLabel}>To Get Results</span>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Everything you need to start smart</h2>
          <p className={styles.sectionSub}>Built for college students and first-time entrepreneurs in India</p>
          <div className={styles.featureGrid}>
            {features.map(f => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>
                  <f.icon size={22} color="var(--brown)" />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.models}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>3 Models We Analyze</h2>
          <p className={styles.sectionSub}>All suitable for beginners with limited budgets</p>
          <div className={styles.modelCards}>
            {[
              { name: 'Dropshipping', tag: 'Easy', color: '#E8F5E9', tagColor: '#10B981', desc: 'Sell products without holding inventory. Supplier ships directly to your customer.' },
              { name: 'Affiliate Marketing', tag: 'Easy', color: '#FDE8F0', tagColor: '#E91E8C', desc: 'Promote products online and earn commissions. Zero inventory. Zero risk.' },
              { name: 'Subscription Box', tag: 'Medium', color: '#FFF3E0', tagColor: '#F59E0B', desc: 'Curate themed product boxes and ship to subscribers monthly for recurring revenue.' },
            ].map(m => (
              <div key={m.name} className={styles.modelCard} style={{ background: m.color }}>
                <span className={styles.modelTag} style={{ color: m.tagColor, background: 'white' }}>{m.tag}</span>
                <h3 className={styles.modelName}>{m.name}</h3>
                <p className={styles.modelDesc}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionSub}>Three simple steps to your business model</p>
          <div className={styles.steps}>
            {steps.map((s, i) => (
              <div key={s.num} className={styles.step}>
                <div className={styles.stepNum}>{s.num}</div>
                {i < steps.length - 1 && <div className={styles.stepLine} />}
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to find your business model?</h2>
          <p className={styles.ctaDesc}>Join thousands of first-time entrepreneurs who started their journey here.</p>
          <button className={styles.primaryBtn} onClick={() => nav('/questionnaire')}>
            Start Free Analysis <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2024 StartupPlanner · Built for first-time entrepreneurs in India</p>
      </footer>
    </div>
  );
}
