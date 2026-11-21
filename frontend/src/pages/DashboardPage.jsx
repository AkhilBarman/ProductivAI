import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Loader2, Moon, BookOpen, Dumbbell,
  Monitor, Smartphone, Coffee, Smile, RotateCcw,
  Sliders, ShieldCheck, Activity, BarChart2
} from 'lucide-react'
import CircularProgress from '../components/CircularProgress'
import InsightsPanel from '../components/InsightsPanel'
import SuggestionsPanel from '../components/SuggestionsPanel'
import ScoreBreakdownChart from '../components/ScoreBreakdownChart'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PRESETS = [
  {
    name: 'Balanced',
    desc: 'Optimal work-life equilibrium',
    values: { sleep_hours: 8, study_hours: 6, exercise_minutes: 45, screen_time_hours: 4, social_media_hours: 1, breaks_taken: 4, mood_level: 8 },
  },
  {
    name: 'Deep Work',
    desc: 'Intense cognitive focus & high output',
    values: { sleep_hours: 7.5, study_hours: 8, exercise_minutes: 30, screen_time_hours: 5, social_media_hours: 0.5, breaks_taken: 5, mood_level: 9 },
  },
  {
    name: 'Exam Sprint',
    desc: 'High study load with disciplined breaks',
    values: { sleep_hours: 6.5, study_hours: 10, exercise_minutes: 20, screen_time_hours: 6, social_media_hours: 1, breaks_taken: 4, mood_level: 7 },
  },
  {
    name: 'Rest & Recovery',
    desc: 'Focus on sleep, exercise, and mental recharge',
    values: { sleep_hours: 9, study_hours: 2, exercise_minutes: 60, screen_time_hours: 3, social_media_hours: 1.5, breaks_taken: 3, mood_level: 8 },
  },
]

const fields = [
  { key: 'sleep_hours',        label: 'Sleep Hours',        icon: Moon,       min: 2,  max: 12,  step: 0.5, default: 7,  hint: 'Ideal: 7–9h',  desc: 'Actual sleep duration' },
  { key: 'study_hours',        label: 'Study Hours',        icon: BookOpen,   min: 0,  max: 14,  step: 0.5, default: 4,  hint: 'Target: 4–8h', desc: 'Active focused work/study' },
  { key: 'exercise_minutes',   label: 'Exercise (min)',     icon: Dumbbell,   min: 0,  max: 120, step: 5,   default: 30, hint: 'Target: 30–60m', desc: 'Cardio, gym, or brisk walk' },
  { key: 'screen_time_hours',  label: 'Screen Time (hrs)',  icon: Monitor,    min: 0,  max: 16,  step: 0.5, default: 4,  hint: 'Keep ≤ 5h',    desc: 'Passive entertainment & gaming' },
  { key: 'social_media_hours', label: 'Social Media (hrs)', icon: Smartphone, min: 0,  max: 8,   step: 0.5, default: 2,  hint: 'Keep ≤ 1.5h',  desc: 'Feeds, reels & browsing' },
  { key: 'breaks_taken',       label: 'Breaks Taken',       icon: Coffee,     min: 0,  max: 10,  step: 1,   default: 3,  hint: 'Optimal: 3–5', desc: '5–15 min off-screen pauses' },
  { key: 'mood_level',         label: 'Mood & Energy',      icon: Smile,      min: 1,  max: 10,  step: 1,   default: 7,  hint: 'Scale: 1–10',  desc: 'Subjective mental alertness' },
]

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div className="glass-card" style={{ padding: '36px 32px' }}>
        <div style={{ width: 160, height: 24, margin: '0 auto 28px' }} className="skeleton-pulse" />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 48 }}>
          <div style={{ width: 160, height: 160, borderRadius: '50%' }} className="skeleton-pulse" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: 280 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ height: 68 }} className="skeleton-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '28px 24px', height: 260 }}>
        <div style={{ width: 180, height: 20, marginBottom: 20 }} className="skeleton-pulse" />
        <div style={{ height: 160 }} className="skeleton-pulse" />
      </div>
    </motion.div>
  )
}

function EmptyStatePrompt({ onSelectPreset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card"
      style={{ padding: '36px 28px', textAlign: 'center' }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Activity size={24} color="#3b82f6" />
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
        Awaiting Routine Evaluation
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 540, margin: '0 auto 28px auto', lineHeight: 1.6 }}>
        Configure your daily metrics above or choose a preset routine, then click <strong>Predict Productivity</strong> to generate an ML-backed score, factor breakdown, and qualitative suggestions.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          maxWidth: 780,
          margin: '0 auto',
          textAlign: 'left',
        }}
      >
        <div style={{ padding: '16px 18px', background: 'var(--input-bg)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <ShieldCheck size={16} color="#22c55e" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Trained ML Inference</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Continuous regression scoring evaluated through trained Scikit-learn regression model.
          </p>
        </div>

        <div style={{ padding: '16px 18px', background: 'var(--input-bg)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <BarChart2 size={16} color="#3b82f6" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Factor Contributions</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Donut visualizer separating positive drivers (sleep, study, mood) and friction habits.
          </p>
        </div>

        <div style={{ padding: '16px 18px', background: 'var(--input-bg)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sliders size={16} color="#8b5cf6" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Actionable Advice</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Concrete delta targets (e.g., reduce screen time by 1.5h) to optimize daily capacity.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          onClick={() => onSelectPreset(PRESETS[0])}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--primary)',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ⚡ Load Recommended Balanced Routine
        </button>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('lastInput')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        /* Fall back to defaults on corrupted localStorage */
      }
    }
    return Object.fromEntries(fields.map(f => [f.key, f.default]))
  })

  const [activePreset, setActivePreset] = useState(null)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleChange = (key, value) => {
    setActivePreset(null)
    setFormData(prev => ({ ...prev, [key]: Number(value) }))
  }

  const handleApplyPreset = (preset) => {
    setActivePreset(preset.name)
    setFormData(preset.values)
  }

  const handleReset = () => {
    setActivePreset(null)
    setFormData(Object.fromEntries(fields.map(f => [f.key, f.default])))
    setResult(null)
    setError(null)
  }

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error(`Prediction failed with HTTP ${res.status}`)
      const data = await res.json()
      setResult(data)
      localStorage.setItem('lastInput', JSON.stringify(formData))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Daily Routine Analyzer
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>
            Configure your lifestyle metrics to predict your productivity score and receive tailored insights.
          </p>
        </div>

        <button
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            background: 'var(--input-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Reset to default values"
        >
          <RotateCcw size={14} />
          Reset Defaults
        </button>
      </motion.div>

      {/* ── Quick Presets ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Quick Routine Presets:
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className={`preset-chip ${activePreset === preset.name ? 'active' : ''}`}
              onClick={() => handleApplyPreset(preset)}
              title={preset.desc}
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Cards ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {fields.map(({ key, label, icon: Icon, min, max, step, hint, desc }) => (
          <motion.div
            key={key}
            variants={fadeUp}
            className="glass-card"
            style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                  <Icon size={15} color="var(--primary)" />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontWeight: 500 }}>
                  {hint}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: 0 }}>{desc}</p>
            </div>

            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={formData[key]}
              onChange={e => handleChange(key, e.target.value)}
              aria-label={label}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={formData[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{
                  width: 72,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 8,
                  padding: '6px 0',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'background 0.3s, border-color 0.2s',
                }}
                aria-label={`${label} numeric value`}
              />
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                {min} – {max}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Predict Button ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
      >
        <button
          onClick={handlePredict}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 40px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.75 : 1,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.28)',
            transition: 'all 0.25s ease',
          }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Evaluating Routine...' : 'Predict Productivity'}
        </button>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            padding: '14px 18px',
            borderColor: 'rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            fontSize: 13,
            textAlign: 'center',
            marginBottom: 32,
            background: 'rgba(239, 68, 68, 0.05)',
          }}
        >
          ⚠ Prediction request failed: {error}. Check backend connection at <code>{API_URL}</code>.
        </motion.div>
      )}

      {/* ── Results, Loading, or Empty State ── */}
      <AnimatePresence mode="wait">
        {loading && <DashboardSkeleton key="loading-state" />}

        {!loading && result && (
          <motion.div
            key="results-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Score + Summary */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, type: 'spring', stiffness: 220 }}
              className="glass-card glow"
              style={{ padding: '36px 32px' }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 28px 0' }}>
                Prediction Result
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 48 }}>
                <CircularProgress value={result.productivity_score} label={result.category} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 280, width: '100%' }}>
                  {[
                    { label: 'Score',    value: result.productivity_score, suffix: '/100' },
                    { label: 'Category', value: result.category },
                    { label: 'Sleep',    value: `${formData.sleep_hours}h` },
                    { label: 'Study',    value: `${formData.study_hours}h` },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.08 }}
                      style={{ background: 'var(--input-bg)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--card-border)' }}
                    >
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, margin: '4px 0 0 0' }}>
                        {item.value}{item.suffix || ''}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Score Breakdown */}
            <ScoreBreakdownChart breakdown={result.score_breakdown} />

            {/* AI Insights */}
            <InsightsPanel insights={result.insights} />

            {/* Suggestions */}
            <SuggestionsPanel suggestions={result.suggestions} />
          </motion.div>
        )}

        {!loading && !result && (
          <EmptyStatePrompt key="empty-state" onSelectPreset={handleApplyPreset} />
        )}
      </AnimatePresence>
    </div>
  )
}
